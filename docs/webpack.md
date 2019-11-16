- 安装 webpack 依赖
  ```
  npm i webpack webpack-cli webpack-merge webpack-node-externals -D
  ```
- 安装 loader
  ```
  npm i vue-loader vue-template-compiler babel-loader url-loader -D
  ```
- 安装插件
  ```
  npm i friendly-errors-webpack-plugin -D
  ```
- 安装环境配置
  ```
  npm i cross-env -D
  ```
- 配置 babel
  - 配置 `.babelrc.js`
    ```
    module.exports = {
      'presets': [ '@babel/preset-env' ]
    }
    ```
- 配置
