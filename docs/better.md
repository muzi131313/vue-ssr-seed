## 开发
- babel-loader 增加缓存：加快打包速度
  - 实现：`loader: 'babel-loader?cacheDirectory'`
## 生产
- **micro-caching** 缓存策略
  - 场景：为所有用户渲染同样的页面
  - 实现
    > 三选一

    - Nginx 配置
      - [micro-caching](https://www.nginx.com/blog/benefits-of-microcaching-nginx/)
      - Nginx 实现
        ```
        server {
          proxy_cache one;
          proxy_cache_lock on;
          # 缓存数量 200，缓存有效时间 1s
          proxy_cache_valid 200 1s;
          proxy_cache_use_stale updating;
          # ...
        }
        ```
    - NodeJS 中使用 lru-cache 实现
      - 利用 `lru-cache`，根据 `req.url`，进行缓存
      - 缓存根据实际场景设置
        - 条数：可以缓存的数目（根据页面的总数量）
        - 时间：缓存失效时间（多少时间内总是使用缓存内的数据）
    - NodeJS 中使用 route-cache 实现
      - 安装依赖：`npm i route-cache -s`
      - 实现代码
        ```javascript
        const microcache = require('route-cache')
        const useMicroCache = process.env.MICRO_CACHE !== 'false'
        // since this app has no user-specific content, every page is micro-cacheable.
        // if your app involves user-specific content, you need to implement custom
        // logic to determine whether a request is cacheable based on its url and
        // headers.
        // 5-minutes microcache.
        // https://www.nginx.com/blog/benefits-of-microcaching-nginx/
        app.use(microcache.cacheSeconds(1000 * 60 * 5, req => useMicroCache && req.originalUrl))
        ```
      - [route-cache/index.js](https://github.com/bradoyler/route-cache/blob/master/index.js)
        - [lru-cache#options](https://www.npmjs.com/package/lru-cache#options)
          - `max`: 缓存最大体积, Number类型, 如果设置为 0，则为 `Infinity`(默认值)
          - `maxAge`: 缓存最大时间
          - `length`: 计算存储项的长度
        - 默认选项
          - `max`: `64mb`
          - `length`
            ```javascript
            function (n, key) {
              if (n.body && typeof n.body === 'string') {
                return n.body.length
              }
              return 1
            }
            ```
          - `maxAge`: `200ms`
        - 重写了 `res.send`, `res.end`, `res.json`, `res.redirect`
        - 对于 `res.send` 和 `res.json`: 如果有缓存值，直接返回缓存值；否则重新进行缓存
        - 对于 `res.send` 和 `res.redirect`: 增加一个队列, 最后在 `process.nextTick()` 处理队列中的回调

- 组件级别缓存
  - 场景：适合 `for` 循环级别的组件
  - 不适合
    - 有可能依赖全局组件的子组件
    - 具有对渲染 *上下文* 产生副作用的子组件
  - 实现
    - 设置 `createRenderer` 的 cache 选项
      ```javascript
      const LRU = require('lru-cache')

      const renderer = createRenderer({
        cache: new LRU({
          max: 1000,
          maxAge: 1000
        })
      })
      ```
    - 设置唯一值
      - 设置 `name`：不能重复
      - 设置 `serverCacheKey`：返回唯一值
        ```javascript
        export default {
          name: 'item', // 必选
          props: ['item'],
          serverCacheKey: props => props.item.id
        }
        ```
    - 原理
      - 逻辑
        - 判断页面组件的 serverCacheKey 函数，name，以及 `createRenderer` 的 `cache` 选项 三个条件是否都满足
          - 满足，则走缓存阶段
            - 判断是否有 has 和 get 实现
              - 有 has 实现
                - 走 has 缓存逻辑
                  - 第二个参数回调结果 hit 为 `false`
                    - 走 **get 逻辑**
                  - 第二个参数回调结果 hit 为 `true`
                    - 返回 **缓存**
              - 有 get 实现（*get 逻辑*）
                - 走 get 缓存逻辑
                  - 第二个参回调结果 `res` 为空
                    - 第一次创建
                  - 第二个参回调结果 `res` 有值
                    - 返回 **缓存**
            - 不满足
              - 走 `renderComponentInner` 正常渲染逻辑
        - 不满足
          - 走 `renderComponentInner` 正常渲染逻辑
      - 注意点
        - 三个条件缺一不可，才会走组件缓存
        - `has` 和 `get` 的不同
          - `has`
            - `has` 第二个参数的回调结果是 `hit`
            - `has` 包含 `get` 逻辑
          - `get`
            - `get` 第二个参数的回调结果是 `res`
      - 实践
        - console 相关信息
          ![console.png](http://ww1.sinaimg.cn/large/8c4687a3ly1g922sxj70yj20zi0iijve.jpg)
        - 第一次运行组件缓存列表
          ![first.png](http://ww1.sinaimg.cn/large/8c4687a3ly1g922tw3gp6j212y0qk78i.jpg)
        - 第二次运行组件缓存列表
          ![second.png](http://ww1.sinaimg.cn/large/8c4687a3ly1g922ub4wgbj21300qs0wy.jpg)
      - <details>
          <summary>源码实现</summary>

          ```javascript
          function isDef (v) {
            return v !== undefined && v !== null
          }
          function renderComponent (node, isRoot, context) {
            var getKey = Ctor.options.serverCacheKey;
            var name = Ctor.options.name;
            var cache = context.cache;
            if (isDef(getKey) && isDef(cache) && isDef(name)) {
              // 调用自定义函数 serverCacheKey，如果能获取到值，则开始组件缓存阶段，否则执行 renderComponentInner 的逻辑
              var rawKey = getKey(node.componentOptions.propsData);
              if (rawKey === false) {
                renderComponentInner(node, isRoot, context);
                return
              }
              // 判断是否有 has 和 get 的实现
              if (isDef(has)) {
                has(key, function (hit) {
                  // 判断是否有 get 的实现
                  if (hit === true && isDef(get)) {
                    get(key, function (res) {
                      if (isDef(registerComponent)) {
                        registerComponent(userContext);
                      }
                      res.components.forEach(function (register) { return register(userContext); });
                      write(res.html, next);
                    });
                  }
                  // 走 set 缓存
                  else {
                    renderComponentWithCache(node, isRoot, key, context);
                  }
                });
              }
              else if (isDef(get)) {
                get(key, function (res) {
                  // 判断是否有 res 的实现
                  if (isDef(res)) {
                    if (isDef(registerComponent)) {
                      registerComponent(userContext);
                    }
                    res.components.forEach(function (register) { return register(userContext); });
                    write(res.html, next);
                  }
                  // 走 get 缓存
                  else {
                    renderComponentWithCache(node, isRoot, key, context);
                  }
                });
              }
            } else {
              // 走 renderComponentInner
              renderComponentInner(node, isRoot, context);
            }
          }
          ```
        </details>
