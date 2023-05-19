import React from "./libs/react";

// const element = Didact.createElement(
//   "div",
//   { id: "foo" },
//   Didact.createElement("a", null, "bar"),
//   Didact.createElement("b")
// );

const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

console.log(React, element);
