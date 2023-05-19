import Didact from "./libs/react";

// const element = Didact.createElement(
//   "div",
//   { id: "foo" },
//   Didact.createElement("a", null, "bar"),
//   Didact.createElement("b")
// );

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

console.log(Didact, element);
