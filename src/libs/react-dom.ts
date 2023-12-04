import { Fiber } from "./fiber";
import { ReactElement, JSXElementConstructor } from "./react";
import * as _ from "lodash";

// 以下有几个概念需要理解
// Concurrent Mode 并发模式：允许react渲染时优先让浏览器去响应高优的工作内容，例如动画、表单输入等
// Fiber： 一种链表的数据结构，一个Fiber对应一个工作单元。Fiber内通过parent、child、sibling分别指向父节点、第一个子节点、下一个同级节点。该结构方便我们能以深度优先的方式遍历每个节点。
// Render Phase and Commit Phases：React执行渲染分成两个阶段，第一个Render Phase阶段、第二个Commit Phases阶段。第一阶段负责遍历每个ReactElement并执行，第二阶段负责生成dom节点并插入html
// Reconciliation 调和：这里用到了diff算法，比较新旧两个Fiber，判断哪些元素需要更新到dom节点（因为dom节点的操作开销比较大，需要避免不必要的dom操作），然后执行更新

/** 判断该属性是否是事件 */
const _isEvent = (key: string) => key.startsWith("on");
/** 是否style */
const _isStyle = (key: string) => key === "style";
/** 判断是否属性 */
const _isProperty = (key: string) =>
  key !== "children" && !_isEvent(key) && !_isStyle(key);
/** 是否新属性 */
const _isNew =
  (prev: Record<string, any>, next: Record<string, any>) => (key: string) =>
    prev[key] !== next[key];
/** 属性是否已删除 */
const _isGone =
  (prev: Record<string, any>, next: Record<string, any>) => (key: string) =>
    !(key in next);

/** 依据fiber节点 创建dom节点 */
function createDom(fiber: Fiber) {
  let dom: HTMLElement | Text;

  if (typeof fiber.type === "string") {
    dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);
  }

  // 处理一般属性
  Object.entries(fiber.props || {})
    .filter(([k]) => _isProperty(k))
    .forEach(([k, v]) => {
      (dom as any)[k] = v;
    });

  // 处理事件
  Object.keys(fiber.props)
    .filter(_isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, fiber.props[name]);
    });

  // 处理style
  if (typeof fiber.props.style === "object") {
    Object.entries(fiber.props.style).forEach(([key, value]) => {
      // 如果是纯数字的话就转成 数字+px ，不确定react是不是这样实现的 TODO
      if (typeof value === "number") value = value + "px";

      (dom as any).style[key] = value;
    });
  }

  return dom;
}

/** 下一个工作单元 */
let nextUnitOfWork = null as Fiber | null;
// 最近提交到DOM的fiber根节点，调和（reconciliation）用。
let currentRoot = null as Fiber | null;
// 进行中的工作,fiber根节点 （wip 是 work in progress 的缩写）
let wipRoot = null as Fiber | null;
// reconciliation 阶段，梳理出来需要删除的fiber
let deletions = null as Fiber[] | null;
// hook索引，执行中的 hook 会读取
let hookIndex = null as number | null;
// 进行中的工作的 fiber 节点，执行中的 hook 会读取
let wipFiber = null as Fiber | null;

// 测试用
(window as any).getCur = () => {
  return currentRoot;
};

/** 工作循环（浏览器闲暇时间执行） */
function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  // 存在下一个工作单元，且浏览器任有空闲时间剩余,就继续执行下一个工作单元
  // 这里对应 render phase
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果没有下一个需要执行的工作单元，且存在进行中的工作，那么就提交根节点进入commit phase 阶段
  // 这里对应 commit phase
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function useState<T>(initial: T) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: (oldHook ? oldHook.state : initial) as T,
    queue: [] as (((value: T) => T) | T)[],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action: any) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  const setState = (action: ((value: T) => T) | T) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState] as const;
}

type Destructor = () => void;

type DependencyList = ReadonlyArray<any>;

type EffectCallback = () => void | Destructor;

function useEffect(effect: EffectCallback, deps?: DependencyList): void {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    deps: deps,
    effect: effect,
    destructor: null as void | Destructor,
  };

  if (!oldHook) {
    // 如果是第一次调用，那么直接执行回调
    // TODO 感觉这里执行的时机不太对，应该在页面渲染完毕后再执行才对
    hook.destructor = effect();
  } else if (deps && deps.length > 0) {
    // 如果依赖项不同，那么执行回调
    const oldDeps = oldHook.deps;
    const oldDestructor = oldHook.destructor;
    const isDifferent = deps.some((val, ind) => val !== oldDeps[ind]);

    if (isDifferent) {
      // 先执行destructor
      oldDestructor?.();
      hook.destructor = effect();
    }
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
}

function useMemo<T>(memoFn: () => T, deps?: DependencyList): T {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    deps: deps,
    value: oldHook?.value || undefined,
    memoFn,
  };

  if (!oldHook) {
    // 如果是第一次调用，那么直接执行回调
    hook.value = memoFn();
  } else if (deps && deps.length > 0) {
    // 如果依赖项不同，那么执行回调
    const oldDeps = oldHook.deps;
    const isDifferent = deps.some((val, ind) => val !== oldDeps[ind]);

    if (isDifferent) {
      hook.value = memoFn();
    }
  }

  wipFiber.hooks.push(hook);
  hookIndex++;

  return hook.value;
}

function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  // 需要将key和ref剔除掉再将props传到组件函数内，目前先简单这么实现下
  const children = [(fiber.type as JSXElementConstructor<any>)(fiber.props)];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

/** 执行工作单元 */
function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateDom(
  dom: HTMLElement | Text,
  prevProps: Record<string, any>,
  nextProps: Record<string, any>
) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(_isEvent)
    .filter((key) => !(key in nextProps) || _isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // Add event listeners
  Object.keys(nextProps)
    .filter(_isEvent)
    .filter(_isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
  // Remove old properties
  Object.keys(prevProps)
    .filter(_isProperty)
    .filter(_isGone(prevProps, nextProps))
    .forEach((name) => {
      (dom as any)[name] = "";
    });
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(_isProperty)
    .filter(_isNew(prevProps, nextProps))
    .forEach((name) => {
      (dom as any)[name] = nextProps[name];
    });
}

function doDeletion(fiber: Fiber, domParent: HTMLElement | Text) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    doDeletion(fiber.child, domParent);
  }
  // 执行useEffect返回的destructor
  (fiber.hooks || []).forEach((hook) => {
    hook.destructor?.();
  });
}

function findDomParent(fiber: Fiber) {
  // 沿fiber tree向上找，只到找到有dom属性的fiber
  // 为啥需要这样做，因为函数组件没有dom
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  return domParent;
}

/** 提交删除的节点 */
function commitDeletion(fiber: Fiber) {
  const domParent = findDomParent(fiber);
  if (fiber.effectTag === "DELETION") {
    doDeletion(fiber, domParent);
  }
}

/** 提交 */
function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  const domParent = findDomParent(fiber);

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  if (fiber.child) commitWork(fiber.child);
  if (fiber.sibling) commitWork(fiber.sibling);
}

/** 调和children */
function reconcileChildren(wipFiber: Fiber, elements: ReactElement[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null as Fiber | null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      } as Fiber;
    }
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      } as Fiber;
    }
    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      if (prevSibling) {
        prevSibling.sibling = newFiber;
      }
    }

    prevSibling = newFiber;
    oldFiber = oldFiber?.sibling;
    index++;
  }
}

/**
 * commit the whole fiber tree to the DOM
 */
function commitRoot() {
  deletions.forEach((f) => {
    commitDeletion(f);
  });
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

/** ReactDom.render 执行渲染 */
function render(element: any | any[], container: HTMLElement) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  } as Fiber;

  deletions = [];
  nextUnitOfWork = wipRoot;
}

export default {
  render,
};

export { useState, useEffect, useMemo };
