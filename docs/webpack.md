- 安装 webpack 依赖
  ```
  npm i webpack webpack-cli webpack-merge webpack-node-externals -D
  ```
- 安装 loader
  ```
  npm i vue-loader vue-template-compiler css-loader babel-loader url-loader -D
  ```
- 安装插件
  ```
  npm i friendly-errors-webpack-plugin -D
  ```
- 安装环境设置工具
  ```
  npm i cross-env -D
  ```
- 安装文件监听工具
  ```
  npm i chokidar -D
  ```
- 安装热更新
  ```
  npm i webpack-hot-middleware -D
  ```
- webpack-dev 中间件
  ```
  npm i webpack-dev-middleware -D
  ```
- 配置 client-bundle
  ```
  const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
  module.exports = {
    entry: {
      app: './src/entry-client.js'
    },
    plugins: [
      // 默认文件名：vue-ssr-client-manifest.json
      new VueSSRClientPlugin()
    ]
  }
  ```
- 配置 server-bundle
  ```
  const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
  module.exports = {
    entry: './src/entry-server.js',
    target: 'node',
    output: {
      filename: 'server-bundle.js',
      libraryTarget: 'commonjs2'
    },
    plugins: [
      // 服务器整个输出，默认文件名：vue-ssr-server-bundle.json
      new VueSSRServerPlugin()
    ]
  }
  ```
