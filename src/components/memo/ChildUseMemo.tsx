// @ts-nocheck

import React, { useMemo } from "react";

/*

无论是 PureComponent 还是 memo 都是在最外层包裹整个组件，在某些场景下我们只需要对组件的部分进行缓存，
就需要通过 useMemo 来做细粒化的处理

*/

export default (props = {}) => {
  console.log(`--- component re-render ---`);

  return useMemo(() => {
    console.log(`--- useMemo re-render ---`);
    return (
      <div>
        {/* <p>step is : {props.step}</p> */}
        {/* <p>count is : {props.count}</p> */}
        <p>number is : {props.number}</p>
      </div>
    );
  }, [props.number]);
};
