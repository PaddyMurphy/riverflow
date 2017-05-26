<template>
  <div class="conditions" v-show="condition">
    {{ condition }}
  </div>
</template>

<script>

import conditions from '@/conditions.json'

export default {
  name: 'conditions',
  data () {
    return {
      condition: undefined
    }
  },
  props: {
    latestCfs: {
      type: String,
      required: false
    }
  },
  watch: {
    latestCfs: 'displayConditions'
  },
  methods: {
    displayConditions: function () {
      var cfs = parseInt(this.latestCfs, 10);
      // check the range of the cfs and display the appropriate message
      if (cfs === 0) {
        this.condition = conditions.flow0;
      } else if ((cfs > 0) && (cfs < 50)) {
        this.condition = conditions.flow1;
      } else if ((cfs >= 50) && (cfs < 100)) {
        this.condition = conditions.flow2;
      } else if ((cfs >= 100) && (cfs < 300)) {
        this.condition = conditions.flow3;
      } else if ((cfs >= 300) && (cfs < 600)) {
        this.condition = conditions.flow4;
      } else if ((cfs >= 600) && (cfs < 2000)) {
        this.condition = conditions.flow5;
      } else if (cfs >= 2000) {
        this.condition = conditions.flow6;
      }

      return this.condition;
    }
  }
}
</script>

<style scoped lang="sass">

</style>
