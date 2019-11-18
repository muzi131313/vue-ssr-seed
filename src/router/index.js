import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: () => import('../views/Home.vue')
      },
      {
        path: '/item/:id',
        component: () => import(/* webpackChunkName: `item-detail` */ '../views/Item.vue'),
        props: true
      },
      {
        path: `/missing`,
        name: `missing`,
        component: () => import(/* webpackChunkName: `missing` */ '../components/Missing.vue')
      },
      {
        path: '*',
        name: 'lost',
        redirect: '/missing',
        hidden: true
      }
    ]
  })
}
