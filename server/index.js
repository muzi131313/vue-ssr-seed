require('@babel/register')({
  presets: ['@babel/preset-env']
})

const fs = require('fs')
const path = require('path')
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer({
  // 设置模板
  template: fs.readFileSync(path.resolve(__dirname, '../src/template/index.html'), 'utf-8')
})
const { createApp } = require('../src/app')

server.get('*', (req, res) => {
  const { app } = createApp(req.url)
  const context = {
    title: 'vue-ssr-seed',
    meta: `<meta name="demo" content="demo">`
  }

  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      console.error(err)
      res.status(500).end('Internal Server Error')
      return
    }
    // html: 注入应用程序的完整内容
    res.end(html)
  })
})

const PORT = 8080
server.listen(PORT, function(err) {
  if (err) {
    return console.error(err)
  }
  console.info(`server start at: http://localhost:${PORT}`)
})
