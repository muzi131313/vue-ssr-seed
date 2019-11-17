require('@babel/register')({
  presets: ['@babel/preset-env']
})

const fs = require('fs')
const path = require('path')
// const Vue = require('vue')
const express = require('express')
const LRU = require('lru-cache')
const compression = require('compression')
const favicon = require('serve-favicon')
const { createBundleRenderer } = require('vue-server-renderer')

const resolve = _path => path.resolve(__dirname, _path)
const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

let readyPromise = null
let renderer = null
const app = express()
const templatePath = resolve('../src/template/index.html')
// const { createApp } = require('../src/app')
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`
const isProd = process.env.NODE_ENV === 'production'

// doc: https://ssr.vuejs.org/zh/guide/build-config.html#%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%85%8D%E7%BD%AE-client-config
function createRenderer(bundle, optoins) {
  return createBundleRenderer(bundle, Object.assign(optoins, {
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
}

if (isProd) {
  const bundle = require('../dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync(templatePath, 'utf-8')
  const clientManifest = require('../dist/vue-ssr-client-manifest.json')
  renderer = createRenderer(bundle, {
    template,
    clientManifest
  })
}
else {
  const setupDevServer = require('../build/setup-dev-server')
  readyPromise = setupDevServer(app, templatePath, (bundle, options) => {
      try {
        renderer = createRenderer(bundle, options)
      }
      catch (e) {
        console.log('createRenderer exits error: ', e)
      }
  })
}

const microCache = new LRU({
  max: 100,
  maxAge: 1000 * 60 * 5 // 重要提示：条目在 5 分钟后过期。
})

// 是否是可缓存页面
const isCacheable = req => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定 (non-user-specific) 页面才会缓存
  return true
}

function render(req, res) {
  const start = Date.now()

  const cacheable = isCacheable(req)
  if (cacheable && isProd) {
    const hit = microCache.get(req.url)
    if (hit) {
      return res.end(hit)
    }
  }

  const context = {
    title: '',
    url: req ? req.url : ''
  }

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Server', serverInfo)
  renderer.renderToString(context, (err, html) => {
    if (err) {
      console.error(err)
      return res.status(500).end('Internal Server Error')
    }
    res.end(html)
    if (!isProd) {
      console.log(`whole request: ${Date.now() - start}ms`)
    }
  })
}

app.use(compression({ threshold: 0 }))
app.use(favicon(resolve('../public/logo-256.png')))
app.use('/dist', serve('../dist', true))
app.use('/public', serve('../public', true))
app.use('/manifest.json', serve('../manifest.json', true))
app.use('/service-worker.js', serve('../dist/service-worker.js'))

const getAll = isProd
  ? render
  : (req, res) => {
    readyPromise.then(() => render(req, res))
  }

app.get('*', getAll)

const PORT = 8080
app.listen(PORT, function(err) {
  if (err) {
    return console.error(err)
  }
  console.info(`server start at: http://localhost:${PORT}`)
})
