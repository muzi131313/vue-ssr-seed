- 安装 [lru-cache](https://www.npmjs.com/package/lru-cache): `npm i lru-cache -s`
  - 初始化需要new:
    ```
    const LRU = require('lru-cache')
    const lru = new LRU({})
    ```
- 安装 [compression](https://www.npmjs.com/package/compression): `npm i compression -s`
  - 应用: `app.use(compression({}))`

- 安装 [serve-favicon](https://www.npmjs.com/package/compression): `npm i serve-favicon -s`
  - 设置网站favicon:
    ```
    const favicon = require('serve-favicon')
    app.use(favicon(path.resolve(__dirname, '../public/logo-256.png')))
    ```
