import React, { useState } from "react";
// import { unstable_batchedUpdates } from "react-dom";

function BatchState() {
  console.log("😪 # BatchState # rerender");

  // const [a, setA] = useState(1);
  // const [b, setB] = useState({});
  // const [c, setC] = useState(1);
  const [num, setNum] = useState(1);
  const [str, setStr] = useState("a");
  // const handerClick = () => {
  //   setB({ ...b });
  //   setC(c + 1);
  //   setA(a + 1);
  // };
  const handerClick = () => {
    setTimeout(() => {
      setNum(2); // 这里触发的console.log('render')是没必要的
      setStr("c"); // 我们仅仅需要这里触发console.log('render')
      // setB({ ...b });
      // setC(c + 1);
      // setA(a + 1);
    }, 1000);

    // Promise.resolve().then(() => {
    //   unstable_batchedUpdates(() => {
    //     setB({ ...b });
    //     setC(c + 1);
    //     setA(a + 1);
    //   });
    // });

    // PS: 怪不得测试的 unstable_batchedUpdates 无论有没有，表现都一致为批量更新
    // React 18 已经默认内置了批处理，unstable_batchedUpdates 这是之前 16/17 才需要的手动处理
  };

  return (
    <>
      <button onClick={handerClick}>执行更新</button>
      <span>{num}</span>
      <span>{str}</span>
    </>
  );
}

export default BatchState;
