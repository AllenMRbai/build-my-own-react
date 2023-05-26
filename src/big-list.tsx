import React from "./libs/react";
import { useState, useEffect } from "./libs/react-dom";

function ListItem(props: any) {
  useEffect(() => {
    console.log("初始化数字", props.value);
    return () => {
      console.log("卸载数字", props.value);
    };
  }, [props.value]);

  return <h4>{props.value}</h4>;
}

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
        <ListItem value={a} />
      ))}
    </div>
  );
}

export default BigList;
