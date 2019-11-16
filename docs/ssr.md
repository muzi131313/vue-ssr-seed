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
### 服务端打包
- 服务端渲染：需要打包成 **服务器 bundle**

### 客户端打包
- 客户端渲染：需要打包生成 **客户端 bundle** 发送给浏览器，用于 *混合静态标记*

## 版本列表
- [simple version](https://github.com/muzi131313/vue-ssr-seed/tree/8e4bcb6575a457fe971d4773ffd323c635554ee4): 最简单的版本
- []()
