// webpack.base.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDev = process.env.NODE_ENV === "development"; // 是否是开发模式

module.exports = {
  entry: path.join(__dirname, "../src/index.tsx"), // 入口文件
  // 打包文件出口
  output: {
    filename: "static/js/[name].[chunkhash:8].js", // 加上[chunkhash:8]，chunkhash输出
    path: path.join(__dirname, "../dist"), // 打包结果输出路径
    clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
    publicPath: "/", // 打包后文件的公共前缀路径
  },

  module: {
    rules: [
      {
        // 缩小 loader 的作用范围从而节省解析时间
        include: [path.resolve(__dirname, "../src")], // 只对项目src文件的ts,tsx进行loader解析
        test: /.(ts|tsx)$/,
        // thread-loader 开启多线程，使用时,需将此 loader 放置在其他 loader 之前。放置在此 loader 之后的 loader 会在一个独立的 worker 池中运行。
        use: ["thread-loader", "babel-loader"],
      },

      {
        test: /.css$/, //匹配所有的 css 文件
        include: [path.resolve(__dirname, "../src")],
        use: [
          // 打包时我们希望把css单独抽离出来,方便配置缓存策略。
          isDev ? "style-loader" : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /.less$/, //匹配所有的 less 文件
        include: [path.resolve(__dirname, "../src")],
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },

      {
        test: /.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: "static/images/[name].[contenthash:8][ext]", // 加上[contenthash:8]，contenthash输出
        },
      },
      {
        test: /.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: "static/fonts/[name].[contenthash:8][ext]", // 加上[contenthash:8]，contenthash输出
        },
      },
      {
        test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: "static/media/[name].[contenthash:8][ext]", // 加上[contenthash:8]，contenthash输出
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"), // 模板取定义root节点的模板
      inject: true, // 自动注入静态资源，这也是默认值
    }),
    new webpack.DefinePlugin({
      "process.env.BASE_ENV": JSON.stringify(process.env.BASE_ENV),
    }),
  ],

  resolve: {
    extensions: [".js", ".tsx", ".ts"],
    alias: {
      "@": path.join(__dirname, "../src"),
    },
    modules: [path.resolve(__dirname, "../node_modules")], // 查找第三方模块只在本项目的node_modules中查找
  },

  // webpack5 新增的 持久化缓存
  cache: {
    type: "filesystem", // 使用文件缓存
    // https://webpack.docschina.org/configuration/cache#cachetype
  },
};
