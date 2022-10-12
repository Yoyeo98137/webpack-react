# webpack-react

webpack5 + React 18 + Typescript

## 参考

> - https://juejin.cn/post/7111922283681153038
> - https://github.com/guojiongwei/webpack5-react-ts

## 总结

### React

#### 优化

- Class component —— `React.PureComponent`
- Function Component —— `React.memo`（跟 PureComponent 相似，都是浅比较，一个提供给类组件，一个提供给函数组件）
- Hooks —— `useMemo`

无论是 PureComponent 还是 Memo 都是在最外层包裹整个组件，在某些场景下我们只需要对组件的部分进行缓存，  
这就需要通过 `useMemo` 来做细粒化的处理。

### webpack5

#### loader

> 记住，webpack 默认只能识别 js 文件，当我们需要识别其他文件模块时，就需要借助 loader

在 `module.rules` 进行配置：

```js
// webpack.base.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/, // 匹配.ts, tsx文件
        use: {
          loader: "babel-loader",
          options: {
            // 预设执行顺序由右往左,所以先处理ts,再处理jsx
            presets: ["@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      // ...
    ],
  },
};
```

借助 babel 兼容 js、解析 js：

- `babel-loader`: 使用 babel 加载最新 js 代码并将其转换为 ES5
- `@babel/core`：核心模块
- `@babel/preset-typescript`：将 ts 解析为 js
- `@babel/preset-react`：解析 jsx
- `@babel/preset-env`：转换目前最新的 js 标准语法

解析样式：

- `style-loader`：把解析后的 css 代码从 js 中抽离，放到头部的 style 标签中（在运行时做的）
- `css-loader`：解析 css 文件代码
- `less-loader`：解析 less 文件代码
- `postcss-loader`：处理 css 时自动加上兼容前缀

#### plugin

在 plugins 进行配置：

```js
// webpack.base.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"), // 模板取定义root节点的模板
      inject: true, // 自动注入静态资源
    }),
  ],
  // ...
};
```

- `html-webpack-plugin` 生成一个 html 并引入构建好的资源文件，这样才能让我们的项目在浏览器运行起来

> https://webpack.docschina.org/plugins/html-webpack-plugin/#root

#### extensions

尝试按顺序解析这些后缀名。如果有多个文件有相同的名字，但后缀名不同，webpack 会解析列在数组首位的后缀的文件 并跳过其余的后缀。

```js
// webpack.base.js
module.exports = {
  // ...
  resolve: {
    extensions: [".js", ".tsx", ".ts"],
  },
};
```

这能够使用户在引入模块时不需要定义后缀名：

```js
import File from "../path/to/file";
```

> https://webpack.docschina.org/configuration/resolve/#resolveextensions

### webpack-dev-server

开发环境服务器，通过该服务器来启动脚步 `npm run dev`

```js
npm i webpack-dev-server webpack-merge -D
```

### 本地预览打包产物

下载 node 服务器：

```js
npm i serve -g
```

运行打包命令生成 dist 文件夹后，在项目根目录命令行执行 `serve -s dist`，就可以启动打包后的项目了。

> 可能执行 `serve -s dist` 会遇到 shell 语句报错，可能是权限导致的，去查一下开启相关语句权限就好了

### 复制 public 文件夹

借助插件 `copy-webpack-plugin` 将已经存在的资源进行复制：

```js
npm i copy-webpack-plugin -D
```

开发环境通过 `devServer.static` 托管了 public 文件夹，因为在打包构建之后是访问不到的，这时候就需要进行复制：

```js
// webpack.prod.js
// ..
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = merge(baseConfig, {
  mode: "production",
  plugins: [
    // 复制文件插件
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public"), // 复制 public 下文件
          to: path.resolve(__dirname, "../dist"), // 复制到 dist 目录中
          filter: (source) => {
            return !source.includes("index.html"); // 忽略 index.html
          },
        },
      ],
    }),
  ],
});
```

这时候 public 下的内容在打包构建后，就会同步复制到 dist 文件夹了

> https://webpack.docschina.org/plugins/copy-webpack-plugin/#root

### 图片文件处理

对于图片文件，webpack4 使用 `file-loader` 和 · 来处理的，但 webpack5 不使用这两个 loader 了，而是采用自带的 `asset-module` 来处理：

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        type: "asset", // type 选择 asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于 10kb 转b ase64 位
          },
        },
        generator: {
          filename: "static/images/[name][ext]", // 文件输出目录和命名
        },
      },
    ],
  },
};
```

> https://webpack.docschina.org/configuration/module#ruleparserdataurlcondition

### 热更新

在 `devServer.host` 设置为 `true` 的情况下，就已经开启热更新了，每次修改文件浏览器就会自动刷新；  
但是如果想要在浏览器刷新之后仍然保留之前的内容，比如 react 组件的状态，就需要借助插件：

```js
npm i @pmmmwh/react-refresh-webpack-plugin react-refresh -D
```

更新配置，启动热更新：

```js
// webpack.dev.js
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
module.exports = merge(baseConfig, {
  // ...
  plugins: [new ReactRefreshWebpackPlugin()],
});

// webpack.base.js
const isDEV = process.env.NODE_ENV === "development";
module.exports = {
  // ...
  plugins: [
    isDEV && require.resolve("react-refresh/babel"), // 如果是开发模式，就启动 react 热更新插件
    // ...
  ].filter(Boolean), // 过滤空值
};
```

### 构建优化

当进行优化的时候,肯定要先知道时间都花费在哪些步骤上了，而 `speed-measure-webpack-plugin` 插件可以帮我们做到；  
而 `webpack-bundle-analyzer` 是分析 webpack 打包后文件的插件，使用交互式可缩放树形图可视化 webpack 输出文件的大小。通过该插件可以对打包后的文件进行观察和分析。

```js
npm i speed-measure-webpack-plugin -D
npm i webpack-bundle-analyzer -D
```

```js
// 避免影响到正常的开发和生产配置，添加一个额外的 analy 来分析优化
// webpack.analy.js
const prodConfig = require("./webpack.prod.js");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer"); // 引入分析打包结果插件
module.exports = smp.wrap(
  merge(prodConfig, {
    plugins: [
      new BundleAnalyzerPlugin(), // 配置分析打包结果插件
    ],
  })
);
```

#### 开启持久化存储缓存

配置持久化缓存之后的第二次构建过程，会通过对文件进行哈希比对来验证是否一致，如果一致则采用上一次的缓存，极大的节省时间：

```js
// webpack.base.js
// ...
module.exports = {
  // ...
  cache: {
    type: "filesystem", // 使用文件缓存
  },
};
```

> 验证的是模块构建的过程，包括开发模式和打包模式
> https://webpack.docschina.org/configuration/cache#root

#### devtool 配置

开发过程中或者打包后的代码都是 webpack 处理后的代码，如果进行调试肯定希望看到源代码，而不是编译后的代码；  
通过 sourceMap 就可以做到源码映射，不同的映射模式会明显影响到构建和重新构建的速度，devtool 选项就是 webpack 提供的选择源码映射方式的配置。

```js
// webpack.dev.js
module.exports = {
  // ...
  devtool: "eval-cheap-module-source-map",
};
```

#### 其他的

- externals：外包拓展，打包时会忽略配置的依赖，会从上下文中寻找对应变量
- ...

#### css 文件抽离

在开发环境我们希望 css 嵌入在 style 标签里面，方便样式热替换；  
但打包时我们希望把 css 单独抽离出来，方便配置缓存策略。

而插件 `mini-css-extract-plugin` 就是来帮我们做这件事的，安装依赖：

```js
npm i mini-css-extract-plugin -D
```

修改配置，开发环境使用 `style-looader`，生产环境则抽离 css：

```js
// webpack.base.js
// ...
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDev = process.env.NODE_ENV === "development";
module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /.css$/, //匹配所有的 css 文件
        include: [path.resolve(__dirname, "../src")],
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ],
      },
      // ...
    ],
  },
  // ...
};

// webpack.prod.js
// ...
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = merge(baseConfig, {
  mode: "production",
  plugins: [
    // ...
    new MiniCssExtractPlugin({
      filename: "static/css/[name].css", // 抽离 css 的输出目录和名称
    }),
  ],
});
```

#### css 压缩

```js
// webpack.prod.js
// ...
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
module.exports = {
  // ...
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
    ],
  },
};
```

#### js 压缩

```js
// webpack.prod.js
// ...
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  // ...
  optimization: {
    minimizer: [
      // ...
      new TerserPlugin({
        // 压缩js
        parallel: true, // 开启多线程压缩
      }),
    ],
  },
};
```

#### 合理分配文件 hash

项目维护的时候，一般只会修改一部分代码，可以合理配置文件缓存，来提升前端加载页面速度和减少服务器压力。

资源文件和 js 文件有不同的分配策略：

```js
// webpack.base.js
// ...
module.exports = {
  // 打包文件出口
  output: {
    filename: "static/js/[name].[chunkhash:8].js",
    // ...
  },
  module: {
    rules: [
      {
        test: /.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        // ...
        generator: {
          filename: "static/images/[name].[contenthash:8][ext]",
        },
      },
      // ...
    ],
  },
  // ...
};

// webpack.prod.js
// ...
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = merge(baseConfig, {
  mode: "production",
  plugins: [
    // 抽离 css 插件
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css", // 加上[contenthash:8]
    }),
    // ...
  ],
  // ...
});
```

> https://juejin.cn/post/7111922283681153038#heading-33

#### 代码分割

- 提取公共包，减少文件 hash 的变化次数，有效利用浏览器缓存
- 拆分体积，避免主包体积过大导致的首次请求时间过长问题

```js
// webpack.prod.js
module.exports = {
  // ...
  optimization: {
    // ...
    splitChunks: {
      // 分隔代码
      cacheGroups: {
        vendors: {
          // 提取node_modules代码
          test: /node_modules/, // 只匹配node_modules里面的模块
          name: "vendors", // 提取文件命名为vendors,js后缀和chunkhash会自动加
          minChunks: 1, // 只要使用一次就提取出来
          chunks: "initial", // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
          priority: 1, // 提取优先级为1
        },
        commons: {
          // 提取页面公共代码
          name: "commons", // 提取文件命名为commons
          minChunks: 2, // 只要使用两次就提取出来
          chunks: "initial", // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
        },
      },
    },
  },
};
```

#### tree-shaking

Tree Shaking 的意思就是摇树，伴随着摇树这个动作，树上的枯叶都会被摇晃下来，这里的 `tree-shaking` 在代码中摇掉的是未使用到的代码，也就是未引用的代码。

webpack 在 `mode=production` 的模式下会自动开启 `tree-shaking` 功能，以此来标记未引入代码然后移除掉。

#### 资源懒加载

避免所有资源都在初始化的时候被下载下来，增加懒加载来提升初始化速度。

webpack 默认支持资源懒加载，只需要引入资源使用 import 语法来引入资源，webpack 打包的时候就会自动打包为单独的资源文件，等使用到的时候动态加载：

```js
import React, { lazy, Suspense, useState } from "react";
const LazyDemo = lazy(() => import("@/components/LazyDemo")); // 使用 import 语法配合 react 的 Lazy 动态引入资源
```

#### 资源预加载

上面配置了资源懒加载后，虽然提升了首屏渲染速度，但是加载到资源的时候会有一个去请求资源的延时，如果资源比较大会出现延迟卡顿现象；  
可以借助 link 标签的 `rel` 属性 `prefetch` 与 `preload`，link 标签除了加载 css 之外也可以加载 js 资源，设置 `rel` 属性可以规定 link 提前加载资源，但是加载资源后不执行，等用到了再执行。

`rel` 的属性值：

- `preload` 是告诉浏览器页面必定需要的资源，浏览器一定会加载这些资源
- `prefetch` 是告诉浏览器页面可能需要的资源，浏览器不一定会加载这些资源，会在空闲时加载

通过在 import 资源的时候使用 webpack 的魔法注释即可：

```js
// 单个目标
import(
  /* webpackChunkName: "my-chunk-name" */ // 资源打包后的文件 chunkname
  /* webpackPrefetch: true */ // 开启 prefetch 预获取
  /* webpackPreload: true */ // 开启 preload 预获取
  "./module"
);
```

设置了预加载 PreFetch 的时候，会发现浏览器会发出请求，请求图标是一个白底的矩形，里面没有返回内容；  
到了真正需要这个资源的时候，又会再次发出请求，但耗时则是 0ms，因为前面已经进行了预加载了。
