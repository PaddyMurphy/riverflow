import Vue from 'vue'
import Router from 'vue-router'
import Riverflow from 'layouts/Riverflow'
import Streamflow from 'layouts/Streamflow'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'is-active',
  routes: [
    {
      path: '/streamflow',
      name: 'Streamflow',
      component: Streamflow
    },
    {
      path: '/',
      name: 'Riverflow',
      component: Riverflow
    },
    {
      path: '/:river', // TODO: setup url routing
      name: 'RiverflowUrl',
      component: Riverflow
    }
  ]
})
