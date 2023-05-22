import ReactDOM from "./libs/react-dom";
import app from "./app";

const container = document.getElementById("root");

console.time("benchmark ReactDOM.render ==");
setTimeout(() => {
  // 这个会在 ReactDOM.render 和页面渲染完毕后再执行这个console
  // 因为 ReactDOM.render 和页面渲染都是同步的
  console.log("你猜我再哪执行 ==");
}, 0);
ReactDOM.render(app, container);
// 大约 1.1650390625 ms
console.timeEnd("benchmark ReactDOM.render ==");
