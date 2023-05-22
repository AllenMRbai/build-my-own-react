function _isProperty(key: string) {
  return !(key === "children" || key === "key" || key === "ref");
}

const render = (element: any, container: HTMLElement) => {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.entries(element.props || {})
    .filter(([k]) => _isProperty(k))
    .forEach(([k, v]) => {
      dom[k] = v;
    });

  element.props.children.forEach((el: any) => {
    render(el, dom);
  });

  container.appendChild(dom);
};

export default {
  render,
};
