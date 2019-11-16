
- 安装依赖
  ```
  npm i @babel/core @babel/runtime @babel/runtime-corejs3 -s
  npm i @babel/preset-env @babel/plugin-transform-runtime -D
  ```
- 配置 `.babelrc.js`
  ```
  module.exports = {
    'presets': [
      [ '@babel/preset-env', {
        'targets': {
          'browsers': ['> 1%', 'last 2 versions', 'not ie <= 8']
        },
        // https://babeljs.io/docs/en/babel-preset-env#modules
        // 不转换
        'modules': false,
        // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
        'useBuiltIns': 'usage',
        'corejs': { 'version': 3, 'proposals': true },
        'shippedProposals': true
      } ]
    ],
    'plugins': [
      [ '@babel/plugin-transform-runtime', {
        'corejs': 3,
        'proposals': true
      }]
    ]
  }
  ```
- 说明
  - `@babel/core`：babel 转换核心包
  - `@babel/runtime`：转换 ES6 语法
  - `@babel/runtime-corejs3`：转换 API 语法
  - `@babel/preset-env`: 转换 ES6 语法为什么样，或者适配什么浏览器
  - `@babel/plugin-transform-runtime`: 根据引入自动转换，不需要手动单独引入
