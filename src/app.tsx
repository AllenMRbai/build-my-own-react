import React from "./libs/react";
import "./app.css";
import bigList from "./big-list"; // TODO

function App() {
  return (
    <div className="editor">
      <div className="editor-header">
        <button>保存</button>
      </div>
      <div className="editor-main-box">
        {/* 资产面板 */}
        <div className="editor-node-panel" id="dndContainer">
          <div className="node-box" data-type="action">
            <div className="dnd-action-node">动作规则</div>
          </div>
          <div className="node-box" data-type="condition">
            <div className="dnd-condition-node"></div>
            <div className="condition-text">条件规则</div>
          </div>
        </div>
        {/* 画布 */}
        <div id="container"></div>
      </div>
      {/* 操作bar */}
      <ul className="operation-bar">
        <li className="operation-button">+</li>
        <li className="operation-button">-</li>
        <li className="operation-button">上</li>
        <li>
          <span className="operation-button side-button">左</span>
          <span className="operation-button side-button">右</span>
        </li>
        <li className="operation-button">下</li>
      </ul>
      {/* 属性配置 */}
      <div className="config-panel">
        <div className="config-header">属性面板</div>
        <div className="config-body"></div>
      </div>
    </div>
  );
}

export default App;
