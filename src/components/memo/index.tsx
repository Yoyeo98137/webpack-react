// @ts-nocheck

import React, { useState } from "react";
import Child from "./Child";
import ChildMemo from "./ChildMemo";
import ChildUseMemo from "./ChildUseMemo";

/*

父组件进行的逻辑很简单，就是引入两个子组件，并且将三个 state 通过 props 的方式传递给子组件

父组件本身进行的逻辑会进行三个 state 的变化

理论上，父组件每次变化一个 state 都通过 props 传递给了子组件，那子组件就会重新执行渲染。（无论子组件有没有真正用到这个 props）

*/

function DemoMemo() {
  const [step, setStep] = useState(0);
  const handleSetStep = () => {
    setStep(step + 1);
  };

  const [count, setCount] = useState(0);
  const handleSetCount = () => {
    setCount(count + 1);
  };

  const [number, setNumber] = useState(0);
  const handleCalNumber = () => {
    setNumber(count + step);
  };

  return (
    <div>
      <button onClick={handleSetStep}>step is : {step} </button>
      <button onClick={handleSetCount}>count is : {count} </button>
      <button onClick={handleCalNumber}>numberis : {number} </button>
      <hr />
      <Child step={step} count={count} number={number} /> <hr />
      <ChildMemo step={step} count={count} number={number} />
      <ChildUseMemo step={step} count={count} number={number} />
    </div>
  );
}

export default DemoMemo;
