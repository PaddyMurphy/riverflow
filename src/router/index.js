import Vue from 'vue'
import Router from 'vue-router'
import Rivertable from '@/layouts/Rivertable'

Vue.use(Router)

export default new Router({
  linkExactActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Rivertable
    },
    {
      path: '/rivertable',
      name: 'Rivertable',
      component: Rivertable
    },
    {
      path: '/rivertable/:river',
      name: 'RivertableUrl',
      component: Rivertable
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
