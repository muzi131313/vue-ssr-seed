## 通用编码规范
### 数据响应
- 服务端渲染
  - 每个请求都是单独的、全新的应用实例
    - 原因：避免 **交叉请求** 造成的状态污染
    - 推荐做法：避免单例，使用工厂函数
    - 不推荐做法：使用 `runInNewContext: true`
      - 为每一个请求创建 vm 上下文, 伴随显著的性能开销
  - 实际渲染确定型
    - 预渲染：开始渲染时，应用程序就将其解析完成其状态
      - 默认禁用响应式数据
        - 避免：将 **数据** 转换成 **响应式数据** 的开销
- 组件生命周期钩子函数
  - SSR 调用的钩子函数
    - beforeCreate
    - created
  - 注意
    - 避免：在 `beforeCreate` 和 `created` 中使用 **副作用** 代码
      - SSR 不会调用 `beforeDestory`/`destoryed` 销毁函数
- 访问特定平台api
  - 服务端不能使用 `window`/`document` 客户端的 API
    - 例如通讯服务：推荐使用 `axios`
  - 客户端相关API：惰性访问，例如：放到 `mounted` 中
  - 三方 API：不推荐模拟全局变量的 Hack
    - 会干扰其他 Library 的环境检测
- 自定义指令
  - 推荐使用组件运行在 **虚拟DOM**
    - 使用渲染函数 `render Function`
  - 不容易替换组件
    - 服务端 renderer 使用 [directives](https://ssr.vuejs.org/zh/api/#directives) 选项
      - 示例: [v-show](https://github.com/vuejs/vue/blob/dev/src/platforms/web/server/directives/show.js)

## 打包
> 详情见，[webpack](./webpack.md) 打包文档
### 服务端打包
- 服务端渲染：需要打包成 **服务器 bundle**

### 客户端打包
- 客户端渲染：需要打包生成 **客户端 bundle** 发送给浏览器，用于 *混合静态标记*

## 路由和代码分割
- 代码分割/惰性加载：
  - 好处：有助于减少浏览器初始下载中**资源**的体积，改善大体积 bundle 的可交互时间（TTI - time-to-interactive ）
  - 原则：对于首屏，只加载所需
  - 做法
    - 把代码分离到不同的 bundle 中
    - 按需加载/并行加载这些文件
  - 具体好处
    - 获取更小的 bundle
    - 控制资源优先级
- 代码分割的3种做法
  - 入口起点：使用 `entry` 手动配置分离
  - 防止重复：使用 `splitChunksPlugin` 去重和分离 chunk
  - 动态导入：通过模块中的 **内联函数调用** 来分离代码
- `splitChunksPlugin`
  - v4 版本，`CommonsChunkPlugin` 被移除，`optimization.splitChunks` 是新的api
  - 自动分割代码的条件
    > 实践最后两个条件时，会产生更大的 chunks

    - `node_modules` 中的代码，或者新的可以共享的代码
    - 新的 chunk 大于 30kb（min+gz之前）
    - 最大的并行请求数量小于等于5
    - 初始化的并行请求小于等于3

## 数据预获取
### 服务器端数据预取
- 对于匹配到的组件，调用组件上的 `asyncData`（如果有的话）
### 客户端数据预获取
- 如果路由发生变化，则需要调用 `asyncData`，进行数据重新获取
- 数据预取的两种方式
  - 提前预获取
    - 定义：路由跳转前获取数据
    - 适应场景：数据获取时间较短，渲染模块较少
  - 渲染后获取数据
    - 定义：路由跳转后获取数据
    - 适应场景：数据获取时间太长，渲染模块太多
