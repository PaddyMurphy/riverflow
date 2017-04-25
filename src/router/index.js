import Vue from 'vue'
import Router from 'vue-router'
import Riverflow from 'components/Riverflow'
// import Streamflow from 'components/Streamflow'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/streamflow',
    //   name: 'Streamflow',
    //   component: Streamflow
    // },
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
