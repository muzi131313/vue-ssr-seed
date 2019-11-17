## 生产模式
- 和开发环境的区别
  - 开发环境需要监听 *index.template.html模板信息*、*服务端代码*、*客户端代码* 变更
  - 生产环境不需要，只需要读取 *模板信息*，引入打包好的 *服务端 bundle.json*，以及 *客户端clientManifest.json* 就行
- 服务端 render
  ```javascript
  const { createBundleRenderer } = require('vue-server-renderer')
  const bundle = require('../dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync(templatePath, 'utf-8')
  const clientManifest = require('../dist/vue-ssr-client-manifest.json')
  const isProd = process.env.NODE_ENV === 'production'
  const renderer = createRenderer(bundle, {
    template,
    clientManifest
  })
  app.get('*', (req, res) => {
    const context = {
      title: '',
      url: req ? req.url : ''
    }
    res.setHeader('Content-Type', 'text/html')
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
