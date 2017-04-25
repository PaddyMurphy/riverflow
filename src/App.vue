<template>
  <div id="app">
    <!-- TODO: set to dev mode while testing -->
    <navbar v-if="isDev" />
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from 'components/Navbar';

export default {
  name: 'app',
  components: {
    'navbar': Navbar
  },
  computed: {
    isDev: function () {
      if (typeof (process.env.NODE_ENV) === 'string') {
        return (process.env.NODE_ENV === 'development') ? 1 : 0;
      } else {
        return 0;
      }
    }
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
