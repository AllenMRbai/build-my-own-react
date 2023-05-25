import React from "./libs/react";
import { useState } from "./libs/react-dom";

function BigList() {
  const [count, setCount] = useState(4);

  const arr = new Array(Number(count || 1)).fill(1).map((i, ind) => ind);

  const onChange = (evt: any) => {
    console.log("看下值的改变", evt, evt.target.value);
    setCount(() => evt.target.value);
  };

  return (
    <div className="list-container">
      <input placeholder="请输入条数" onInput={onChange} type="text" />
      {arr.map((a) => (
        <h4>{a}</h4>
      ))}
    </div>
  );
}

export default BigList;
