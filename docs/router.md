## 安装
- 依赖安装包安装
  ```
  npm i vue-router vuex vuex-router-sync -s
  ```
## 动态引入
- 组件懒加载，动态 import
  - 详情见 [babel](./babel.md) 中 `dynamic-import`
## 路由
- 客户端路由工厂函数
  - `src/router/index.js` 代码示例
    ```javascript
    import Vue from 'vue'
    import Router from 'vue-router'

    Vue.use(Router)

    export function createRouter () {
      return new Router({
        mode: 'history',
        routes: []
      })
    }
    ```
- 服务端路由处理，`entry-server.js`
  - 客户端在服务端上的代码
    ```javascript
    import { createApp } from './app'

    export default context => {
      return new Promise((resolve, reject) => {
        const { app, router } = createApp()

        // 设置服务器端 router 的位置
        router.push(context.url)

        // 等到 router 将可能的异步组件和钩子函数解析完
        router.onReady(() => {
          const matchedComponents = router.getMatchedComponents()
          // 匹配不到的路由，执行 reject 函数，并返回 404
          if (!matchedComponents.length) {
            return reject({ code: 404 })
          }

          // Promise 应该 resolve 应用程序实例，以便它可以渲染
          resolve(app)
        }, reject)
      })
    }
    ```
  - 路由的应用，在 `server/index.js`
    - 官网上应用示例
      ```javascript
      const createApp = require('/path/to/built-server-bundle.js')

      server.get('*', (req, res) => {
        const context = { url: req.url }

        createApp(context).then(app => {
          renderer.renderToString(app, (err, html) => {
            if (err) {
              if (err.code === 404) {
                res.status(404).end('Page not found')
              } else {
                res.status(500).end('Internal Server Error')
              }
            } else {
              res.end(html)
            }
          })
        })
      })
      ```
    - 原理
      - 服务端调用 `renderer.renderToString` 时，会先调用 `src/entry-server.js` 中的 `Promise` 函数
      - 然后等待有结果后，然后会调用客户端 `src/entry-client.js` 的真正的 `renderToString` 函数
    - `createBundleRenderer`的做法
      - 打包后 `vue-ssr-server-bundle.json`的文件结构
        ```
        {
          "entry": "server-bundle.js",
          "files": {
            "1.server-bundle.js": "",
            "2.server-bundle.js": "",
            "server-bundle.js": ""
          },
          "maps": {
            "1.server-bundle.js": "",
            "2.server-bundle.js": "",
            "server-bundle.js": ""
          }
        }
        ```
      - 文件位置
        - `vue-server-renderer` npm包 `build.dev.js` 中的
      - `createBundleRenderer` 相关
        ```javascript
        // createRenderer$1 是处理 createBundleRenderer 中传入的参数，与默认值合并的处理
        var createBundleRenderer = createBundleRendererCreator(createRenderer$1);
        ```
      - `createBundleRendererCreator` 相关
        ```javascript
        function createBundleRendererCreator(createRenderer) {
          return function createBundleRenderer (bundle, rendererOptions) {
            // 客户端的 renderOptions 相关处理
            var renderer = createRenderer(rendererOptions)
            // src/entry-server.js 服务端入口处理
            var run = createBundleRunner(entry, files, basedir,rendererOptions.runInNewContext);
            return {
              renderToString: function (context, cb) {
                var promise;
                if (!cb) {
                  ((assign = createPromiseCallback(), promise = assign.promise, cb = assign.cb));
                }
                // 此处的 context 是 server/index.js 中的 const context = { title: '', url: req ? req.url : ''}
                run(context)
                  .catch(function (err) {
                    rewriteErrorTrace(err, maps);
                    cb(err);
                  })
                  // 此中的 app 就是 src/entry-server.js 中返回的 Promise 要 resolve 出的 app
                  .then(function (app) {
                    if (app) {
                      renderer.renderToString(app, context, function (err, res) {
                        rewriteErrorTrace(err, maps);
                        cb(err, res);
                      });
                    }
                  });

                return promise
              }
            }
          }
        }
        ```
## store
### 客户端 store 工厂函数
  - `src/store/index.js` 代码示例
    ```javascript
    import Vue from 'vue'
    import Vuex from 'vuex'

    Vue.use(Vuex)

    // 假定我们有一个可以返回 Promise 的工厂函数
    export function createStore () {
      return new Vuex.Store({
        modules: {}
      })
    }
    ```
  - `src/app.js` 中使用
    ```javascript
    import { createStore } from './store'
    import sync from 'vuex-router-sync'

    export default createApp() {
      const store = createStore()

      // 同步路由状态(route state)到 store
      sync(store, router)
      // ...
    }
    ```
  - [vuex-router-sync](https://github.com/vuejs/vuex-router-sync/blob/master/src/index.js)
    ```javascript
    // 注册服务
    store.registerModule(moduleName, {
      namespaced: true,
      state: cloneRoute(router.currentRoute),
      mutations: {
        'ROUTE_CHANGED' (state, transition) {
          store.state[moduleName] = cloneRoute(transition.to, transition.from)
        }
      }
    })
    // 路由跳转后，同步路由信息到 store 上去
    const afterEachUnHook = router.afterEach((to, from) => {
      if (isTimeTraveling) {
        isTimeTraveling = false
        return
      }
      currentPath = to.fullPath
      store.commit(moduleName + '/ROUTE_CHANGED', { to, from })
    })
    ```
### 数据预获取
- 在 Vue 组件上新增 `asyncData` 函数
    ```javascript
    export default {
      asyncData ({ store, route }) {
        // 触发 action 后，会返回 Promise
        return store.dispatch('fetchItem', route.params.id)
      }
    }
    ```
### 服务端数据预获取
- asyncData 调用
  ```javascript
  // 对所有匹配的路由组件调用 `asyncData()`
  Promise.all(matchedComponents.map(Component => {
    if (Component.asyncData) {
      return Component.asyncData({
        store,
        route: router.currentRoute
      })
    }
  })).then(() => {
    // 在所有预取钩子(preFetch hook) resolve 后，
    // 我们的 store 现在已经填充入渲染应用程序所需的状态。
    // 当我们将状态附加到上下文，
    // 并且 `template` 选项用于 renderer 时，
    // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
    context.state = store.state

    resolve(app)
  }).catch(reject)
  ```
### 客户端数据预获取
- 客户端获取服务器预取数据
  ```javascript
  const { app, router, store } = createApp()

  if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }
  ```
- 监听路由变化，从而预获取数据
  ```javascript
  Vue.mixin({
    beforeRouteUpdate (to, from, next) {
      const { asyncData } = this.$options
      if (asyncData) {
        asyncData({
          store: this.$store,
          route: to
        }).then(next).catch(next)
      } else {
        next()
      }
    }
  })
  ```
- 客户端获取两种数据的对应场景
  - 提前预获取：数据获取时间较短，渲染模块较少
  - 渲染后获取数据：数据获取时间太长，渲染模块太多
- 客户端数据获取的两种方式
  - 路由跳转前获取数据
    ```javascript
    router.onReady(() => {
      // 添加路由钩子函数，用于处理 asyncData.
      // 在初始路由 resolve 后执行，
      // 以便我们不会二次预取(double-fetch)已有的数据。
      // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
      router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)

        // 我们只关心非预渲染的组件
        // 所以我们对比它们，找出两个匹配列表的差异组件
        let diffed = false
        const activated = matched.filter((c, i) => {
          return diffed || (diffed = (prevMatched[i] !== c))
        })

        if (!activated.length) {
          return next()
        }

        // 这里如果有加载指示器 (loading indicator)，就触发

        Promise.all(activated.map(c => {
          if (c.asyncData) {
            return c.asyncData({ store, route: to })
          }
        })).then(() => {

          // 停止加载指示器(loading indicator)

          next()
        }).catch(next)
      })

      app.$mount('#app')
    })
    ```
  - 路由跳转后获取数据
    ```javascript
    Vue.mixin({
      beforeMount () {
        const { asyncData } = this.$options
        if (asyncData) {
          // 将获取数据操作分配给 promise
          // 以便在组件中，我们可以在数据准备就绪后
          // 通过运行 `this.dataPromise.then(...)` 来执行其他任务
          this.dataPromise = asyncData({
            store: this.$store,
            route: this.$route
          })
        }
      }
    })
    ```
