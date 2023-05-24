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
  ...children: ReactElement[]
): ReactElement {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
    key: null,
  };
}

export default {
  createElement,
};
