## 开发
- babel-loader 增加缓存：加快打包速度
  - 实现：`loader: 'babel-loader?cacheDirectory'`
## 生产
- [micro-caching](https://www.nginx.com/blog/benefits-of-microcaching-nginx/) 缓存策略
  - 场景：为所有用户渲染同样的页面
  - 实现
    - nginx 配置
    - NodeJS 实现
      - 利用 `lru-cache`，根据 `req.url`，进行缓存
      - 缓存根据实际场景设置
        - 条数：可以缓存的数目（根据页面的总数量）
        - 时间：缓存失效时间（多少时间内总是使用缓存内的数据）
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

