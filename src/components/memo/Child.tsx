// @ts-nocheck

import React from "react";

/*

这个子组件本身没有任何逻辑，也没有任何包装，就是渲染了父组件传递过来的 props.number。

需要注意的是，子组件中并没有使用到 props.step 和 props.count，但是一旦 props.step 发生了变化就会触发重新渲染

*/

export default (props = {}) => {
  console.log(`--- re-render ---`);

  return (
    <div>
      {/* <p>step is : {props.step}</p> */}
      {/* <p>count is : {props.count}</p> */}
      <p>number is : {props.number}</p>
    </div>
  );
};
