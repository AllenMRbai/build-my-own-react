function _isProperty(key: string) {
  return !(key === "children" || key === "key" || key === "ref");
}

// 递归渲染比较占内存，当元素数量达到100万个，就会导致页面没法渲染
// 元素数量为30万时，render方法约花费1秒，由于元素过多，浏览器渲染需要花费将近5秒
// 所以浏览器渲染占了大头，所以react要引入diff算法，避免不必要的dom操作
const render = (element: any | any[], container: HTMLElement) => {
  // 元素可能是数组，例如我们经常用的 map
  if (Array.isArray(element)) {
    element.forEach((el: any) => {
      render(el, container);
    });
    return;
  }

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
