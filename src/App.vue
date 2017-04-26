<template>
  <div id="app">
    <navbar />
    <router-view></router-view>
  </div>
</template>

<script>
import Vue from 'vue'
import '../node_modules/element-ui/lib/theme-default/index.css'
import Elementui from 'element-ui/lib/index'
import locale from 'element-ui/lib/locale/lang/en'
import Navbar from 'components/Navbar';
// install element-ui globally
// http://element.eleme.io/#/en-US
Vue.use(Elementui, { locale });

export default {
  name: 'app',
  components: {
    'navbar': Navbar
  }
}
</script>

<style>
body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000;
}
</style>
