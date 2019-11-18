## 依赖安装
### 客户端相关
- 安装 webpack 相关
  ```
  npm i webpack webpack-cli webpack-merge webpack-node-externals -D
  ```
- 安装 loader 相关
  ```
  npm i vue-loader vue-template-compiler css-loader babel-loader url-loader -D
  ```
- 安装插件
  ```
  npm i friendly-errors-webpack-plugin -D
  ```
### 服务端相关
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
## 基础 webpack 配置
- 基础 webpack 配置
  ```javascript
  module.exports = {
    module: {
      noParse: /es6-promise\.js$/, // avoid webpack shimming process
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false
            }
          }
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: '[name].[ext]?[hash]'
          }
        }
      ]
    }
  }
  ```
- 配置 client-bundle
  ```javascript
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
  ```javascript
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

## 路由处理
- 见 [babel](./babel.md) 中的 dynamic-import 相关的处理

