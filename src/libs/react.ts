type Key = string | number;

export type JSXElementConstructor<P> = (
  props: P
) => ReactElement<any, any> | null;

export interface ReactElement<
  P = any,
  T extends string | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>
> {
  type: T;
  props: P;
  key: Key | null;
}

export type ReactChildren = (ReactElement | boolean | null | ReactChildren)[];

function _flatDeep(arr: any[]) {
  let result = [] as any[];

  arr.forEach((i) => {
    if (Array.isArray(i)) {
      const r = _flatDeep(i);
      result = [...result, ...r];
    } else {
      result.push(i);
    }
  });

  return result;
}

function createTextElement(text: string): ReactElement<any, any> {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [] as any[],
    },
    key: null,
  };
}

function createElement(
  type: string | JSXElementConstructor<any>,
  props: any = {},
  ...children: (ReactElement | boolean | null)[]
): ReactElement {
  const result = {
    type,
    props: {
      ...props,
      children: _flatDeep(children) // 支持渲染array
        // 以下值不渲染
        .filter(
          (child) =>
            child !== false &&
            child !== true &&
            child !== undefined &&
            child !== null
        )
        .map((child) =>
          typeof child === "object" ? child : createTextElement(child)
        ),
    },
    key: null,
  } as ReactElement;

  return result;
}

export default {
  createElement,
};
