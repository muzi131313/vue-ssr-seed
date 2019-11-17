import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'

Vue.use(Vuex)

// 假定我们有一个可以返回 Promise 的
export function createStore () {
  return new Vuex.Store({
    modules: {
      user
    }
  })
}
