import ReactDOM from "./libs/react-dom";
import React from "./libs/react";
import app from "./app";

const container = document.getElementById("root");

function App(props: any) {
  return (
    <div>
      <h1>Hi {props.name}</h1>
      <h2>welcome to the new world!</h2>
    </div>
  );
}

ReactDOM.render(<App name="foo" />, container);
