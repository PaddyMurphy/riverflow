import Vue from 'vue'
import Router from 'vue-router'
import Riverflow from 'components/Riverflow'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Riverflow',
      component: Riverflow
    },
    {
      path: '/:river',
      name: 'RiverflowUrl',
      component: Riverflow
    }
  ]
})
