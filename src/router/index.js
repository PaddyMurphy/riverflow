import Vue from 'vue'
import Router from 'vue-router'
import Riverflow from 'components/Riverflow'
import Streamflow from 'components/Streamflow'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'is-active',
  mode: 'history',
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
      path: '/flow/:river', // TODO: setup url routing
      name: 'RiverflowUrl',
      component: Riverflow
    }
  ]
})
