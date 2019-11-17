### 释义
- `manifest.json` 作用：构建 `PWA` 离线桌面应用

### 注意
- 静态 URL 匹配
- 动态 URL 匹配

### 配置
- 依赖包: `npm i sw-precache-webpack-plugin -D`
- 配置 `webpack.client.config.js`
  ```javascript
  const SWPrecachePlugin = require('sw-precache-webpack-plugin')
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      // auto generate service worker
      new SWPrecachePlugin({
        cacheId: 'vue-hn',
        filename: 'service-worker.js',
        minify: true,
        dontCacheBustUrlsMatching: /./,
        staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
        runtimeCaching: [
          {
            urlPattern: '/',
            handler: 'networkFirst'
          },
          {
            urlPattern: /\/(top|new|show|ask|jobs)/,
            handler: 'networkFirst'
          },
          {
            urlPattern: '/item/:id',
            handler: 'networkFirst'
          }
        ]
      })
    )
  }
  ```
- `src/entry-client.js`
  ```
  // service worker
  if ('https:' === location.protocol && navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
  }
  ```

## 参考资料
- [manifest.json 简介](https://lavas.baidu.com/pwa/engage-retain-users/add-to-home-screen/introduction)
