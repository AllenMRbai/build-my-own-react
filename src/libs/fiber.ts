import { JSXElementConstructor } from "./react";

export interface Fiber {
  /** 元素类型 */
  type?: string | JSXElementConstructor<any>;
  /** 元素属性，内部包含children */
  props?: Record<string, any>;
  /** 指向父fiber  */
  parent?: Fiber;
  /** 指向子fiber  */
  child?: Fiber | null;
  /** 指向兄弟fiber  */
  sibling?: Fiber | null;
  /** HTML DOM元素 */
  dom?: HTMLElement | Text | null;
  /** 指向老的fiber节点， */
  alternate?: Fiber;
  /** 标识，commit phase阶段通过这个标识做对应的处理 */
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION";
  /** hooks */
  hooks?: any[];
}
