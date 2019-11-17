
## 基础配置
- 安装依赖
  ```
  npm i @babel/core @babel/runtime core-js@3 @babel/runtime-corejs3 -s
  npm i @babel/preset-env @babel/plugin-transform-runtime @babel/plugin-syntax-dynamic-import -D
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
      }],
      '@babel/plugin-syntax-dynamic-import'
    ]
  }
  ```
- 说明
  - `@babel/core`：babel 转换核心包
  - `@babel/runtime`：转换 ES6 语法
  - `@babel/runtime-corejs3`：转换 API 语法
  - `@babel/preset-env`: 转换 ES6 语法为什么样，或者适配什么浏览器
  - `@babel/plugin-transform-runtime`: 根据引入自动转换，不需要手动单独引入
  - `@babel/plugin-syntax-dynamic-import`: 支持 `import()` 语法，实现路由懒加载

## 注意事项
- `babel.config.js` 和 `.babelrc.js`，以及 `.babelrc` 的区别
  - 优先级：`babel.config.js` > `.babelrc.js` > `.babelrc`
  - 导出内容：
    - `babel.config.js` 导出的一个 function
    - `.babelrc.js` 和 `.babelrc` 导出的是一个 Object 对象
- 问题：`Module not found: Error: Can't resolve 'core-js/modules/es.promise'`
  - 需要安装 `corejs@3`: `npm i core-js@3 -s`
  - [core-js#issues500](https://github.com/zloirock/core-js/issues/500#issuecomment-502419152)
