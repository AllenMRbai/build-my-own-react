import React from "./libs/react";

const arr = new Array(300000).fill(1).map((i) => Math.random());

console.time("big list ==");

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

// 30万个元素 花费 102 ms
console.timeEnd("big list ==");

export default bigList;
