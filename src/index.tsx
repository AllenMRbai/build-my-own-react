import ReactDOM from "./libs/react-dom";
import React from "./libs/react";
import App from "./app";
import BigList from "./big-list";
import "./index.css";

const container = document.getElementById("root");

// ReactDOM.render(<App />, container);
ReactDOM.render(<BigList />, container);
