<template>
  <div class="streamflow">
    <div class="header">
      <h1 class="title">Riverflow</h1>
      <p class="tagline">Texas Edition</p>
    </div>

    what

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
