- 安装 [lru-cache](https://www.npmjs.com/package/lru-cache)：缓存组件
  - `npm i lru-cache -s`
  - 初始化需要new:
    ```
    const LRU = require('lru-cache')
    const lru = new LRU({})
    ```
- 安装 [compression](https://www.npmjs.com/package/compression)：代码压缩组件
  - `npm i compression -s`
  - 应用: `app.use(compression({}))`

- 安装 [serve-favicon](https://www.npmjs.com/package/compression)：网站图标应用
  - `npm i serve-favicon -s`
  - 设置网站favicon:
    ```javascript
    const favicon = require('serve-favicon')
    app.use(favicon(path.resolve(__dirname, '../public/logo-256.png')))
    ```
- 静态资源服务 `server/index.js`
  ```javascript
  const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
  })
  app.use('/dist', serve('../dist', true))
  app.use('/public', serve('../public', true))
  ```
- `vue-server-renderer` 中 `createBundleRenderer` 和 `createRenderer` 区别？
  - 处理的对象不一样
    - `createRenderer` 针对单个 `Vue` 示例
    - `createBundleRenderer` 针对 `bundle`、可以是整个客户端项目代码
  - 返回的 `renderer` 中的 `renderToString` 参数不一样
    - `createRenderer` 中的 `renderToString` 参数是 vue 的实例，
      - `createRenderer`: `renderToString(vm: Vue, callback: RenderCallback): void`
    - `createBundleRenderer` 中的 `renderToString` 参数是 object
      - `createBundleRenderer`: `renderToString(context: object, callback: RenderCallback): void`

- 服务器渲染
  ```javascript
  const fs = require('fs')
  const path = require('path')
  const LRU = require('lru-cache')
  const isProd = process.env.NODE_ENV === 'production'
  const resolve = _path => path.resolve(__dirname, _path)
  const readFile = _path => fs.readFileSync(resolve(_path), 'utf-8')
  const bundle = readFile('../dist/vue-ssr-server-bundle.json')
  const options = {
    template: readFile('../src/template/index.html'),
    clientManifest: readFile('../dist/vue-ssr-client-manifest.json')
  }
  const renderer = createBundleRenderer(bundle, Object.assign(optoins, {
    // for component caching
    cache: new LRU({
      max: 1000, // 1000 number
      maxAge: 1000 * 60 * 15 // 15 minutes
    }),
    // this is only needed when vue-server-renderer is npm-linked
    basedir: resolve('../dist'),
    // recommended for performance
    runInNewContext: false
  }))
  app.get('*', (req, res) => {
    const context = {
      title: '',
      url: req ? req.url : ''
    }
    renderer.renderToString(context, (err, html) => {
      if (err) {
        console.error(err)
        return res.status(500).end('Internal Server Error')
      }
      res.send(html)
      if (!isProd) {
        console.log(`whole request: ${Date.now() - start}ms`)
      }
    })
  })
  ```


