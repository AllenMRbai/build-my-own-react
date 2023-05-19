// 期望实现这么一段能力
// const element = <h1 title="foo">Hello</h1>
// const container = document.getElementById("root")
// ReactDOM.render(element, container)

// const element = React.createElement(
//   "h1",
//   { title: "foo" },
//   "Hello"
// )

// const element = {
//   type: "h1",
//   props: {
//     title: "foo",
//     children: "Hello",
//   },
// }

const ele = <h1 title="hi">你好</h1>;

console.log(ele);
