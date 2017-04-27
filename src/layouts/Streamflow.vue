<template>
  <div class="streamflow">
    <h1>streamflow</h1>
  </div> <!-- END streamflow -->
</template>

<script>
// import axios from 'axios'

export default {
  name: 'streamflow',
  data () {
    return {
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/'
    }
  },
  mounted: function () {
    // var vm = this;
  },
  watch: {},
  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  @import '../assets/scss/streamflow.scss';
</style>
