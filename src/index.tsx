import React from "./libs/react";
import ReactDOM from "./libs/react-dom";

const element = (
  <div id="foo">
    <a>bar</a>
    <b />
    <h1>哈哈哈哈</h1>
  </div>
);

const container = document.getElementById("root");
ReactDOM.render(element, container);
