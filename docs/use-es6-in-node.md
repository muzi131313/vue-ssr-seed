- 安装依赖
  ```
  npm install -D @babel/core @babel/preset-env @babel/register
  ```
- 在 `server/index.js` 添加代码
  ```
  require('@babel/register')({
    presets: ['@babel/preset-env']
  })
  ```

## 参考资料
- [example-node-server](https://github.com/babel/example-node-server/blob/master/package.json): 先使用 `@babel/cli` 转换，再用 `nodemon` 运行
  - 使用 `@babel/cli` 转换: `babel lib -d dist`
- [Node.js 中使用 ES6 中的 import / export 的方法大全](https://cloud.tencent.com/developer/article/1368979): 很全，最后自定义 `loader`，不推荐生成环境使用
- [【译】在 Node 和 Express 中使用 ES6 （及以上）语法](https://juejin.im/post/5d282e6cf265da1bb9700a27): 翻译的一篇文章，使用 `babel-node`，但是无法使用 `nodemon`
