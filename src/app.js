import Vue from 'vue'
import App from './App.vue'

export function createApp(context) {
  const app = new Vue({
    data: {
      url: context.url
    },
    render: h => h(App)
    // template: `<div>访问的 URL 是： {{ url }}</div>`
  })
  return { app }
}
