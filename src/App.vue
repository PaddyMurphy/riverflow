<template>
  <div id="app">
    <navbar />

    <keep-alive>
      <router-view></router-view>
    </keep-alive>

    <footer-main />
  </div>
</template>

<script>
import FooterMain from '@/components/FooterMain'
import Navbar from '@/components/Navbar'

export default {
  name: 'app',
  data () {
    return {}
  },
  components: {
    'footer-main': FooterMain,
    'navbar': Navbar
  },
  mounted: function () {
  }
}
</script>

<style lang="sass">
// import initial variables
@import '../node_modules/bulma/sass/utilities/initial-variables'
// import custom variables
@import 'assets/scss/bulma-styles.sass'
// Import the rest of Bulma
@import '../node_modules/bulma/bulma'

html,
body
  height: 100%

</style>
