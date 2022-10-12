import React, { lazy, Suspense, useState } from "react";
import Class from "@/components/Class";
import smallImg from "@/assets/images/5kb.png";
import bigImg from "@/assets/images/22kb.png";
import { Demo1, Demo2 } from "@/components";
// import "@/app.less";

import DemoMemo from "@/components/memo/index";

const LazyDemo = lazy(() => import("@/components/LazyDemo")); // 使用import语法配合react的Lazy动态引入资源

// prefetch
const PreFetchDemo = lazy(
  () =>
    import(
      /* webpackChunkName: "PreFetchDemo" */
      /*webpackPrefetch: true*/
      "@/components/PreFetchDemo"
    )
);
// preload
const PreloadDemo = lazy(
  () =>
    import(
      /* webpackChunkName: "PreloadDemo" */
      /*webpackPreload: true*/
      "@/components/PreloadDemo"
    )
);

function App() {
  console.log("更新了");
  console.log("测试测试 hash 更新");

  const [count, setCounts] = useState("");
  const onChange = (e: any) => {
    setCounts(e.target.value);
  };

  const [show, setShow] = useState(false);
  // 点击事件中动态引入css, 设置show为true
  const onClick = () => {
    if (show) return;
    import("@/app.less");
    setShow(true);
  };

  return (
    <>
      {/* 测试热更新后的状态保留 */}
      <h2>webpack5-react-ts</h2>
      {/* <h2>修改后的H2</h2> */}
      <Class />
      <img src={smallImg} alt="小于10kb的图片" />
      <img src={bigImg} alt="大于于10kb的图片" />
      <div className="smallImg"></div> {/* 小图片背景容器 */}
      <div className="bigImg"></div> {/* 大图片背景容器 */}
      <p>受控组件</p>
      <input type="text" value={count} onChange={onChange} />
      <br />
      <p>非受控组件</p>
      <input type="text" />
      <Demo1 />
      <h3 onClick={onClick}>展示（动态加载资源）</h3>
      {/* show为true时加载LazyDemo组件 */}
      {show && (
        <>
          <Suspense fallback={null}>
            <LazyDemo />
          </Suspense>
          <Suspense fallback={null}>
            <PreloadDemo />
          </Suspense>
          <Suspense fallback={null}>
            <PreFetchDemo />
          </Suspense>
        </>
      )}
      <DemoMemo />
    </>
  );
}

export default App;
