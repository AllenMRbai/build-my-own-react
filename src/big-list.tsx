import React from "./libs/react";
import { useState } from "./libs/react-dom";

function BigList() {
  const [count, setCount] = useState(3);

  const arr = new Array(count).fill(1).map((i) => Math.random());

  const bigList = (
    <div className="list-container">
      <div>
        <input type="text" /> <button>设置数量</button>
      </div>
      {arr.map((a) => (
        <h4>{a}</h4>
      ))}
    </div>
  );
}

export default BigList;
