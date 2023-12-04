import React from "./libs/react";
import { useState, useEffect } from "./libs/react-dom";

function createId() {
  return Math.ceil(Math.random() * 100000);
}

function ListItem(props: any) {
  useEffect(() => {
    console.log("初始化数字", props.value);
    return () => {
      console.log("卸载数字", props.value);
    };
  }, [props.value]);

  return (
    <div className="flex-start">
      <h4>{props.value}</h4>
      <div className="operation-button">上移</div>
      <div className="operation-button">下移</div>
      <div className="operation-button">删除</div>
      <div className="operation-button">新增</div>
    </div>
  );
}

function BigList() {
  const [count, setCount] = useState(4);
  const [commitCount, setCommitCount] = useState(4);
  const [list, setList] = useState<(string | number)[]>([]);

  const onChange = (evt: any) => {
    console.log("看下值的改变", evt, evt.target.value);
    setCount(() => Number(evt.target.value) || 0);
  };

  const onCommit = () => {
    setCommitCount(count);
  };

  useEffect(() => {
    // TODO 这里加了代码后页面报错了
    // useEffect 和 useState的逻辑应该还是要改
    // useEffect 需要在渲染完毕后再执行。目前会打断当前的render阶段，从头开始演绎
    const newList = new Array(Number(commitCount || 1))
      .fill(1)
      .map(() => createId());
    setList(newList);
  }, [commitCount]);

  return (
    <div className="list-container">
      <div className="flex-start">
        <input placeholder="请输入条数" onInput={onChange} type="text" />
        <button style={{ marginLeft: 6 }} onClick={onCommit}>
          提交
        </button>
      </div>
      {list.map((a) => (
        <ListItem value={a} key={a} />
      ))}
    </div>
  );
}

export default BigList;
