<template>
  <div class="graph-wrapper">
    <div class="graph-loading" v-show="loadingGraph">
      Loading graph...
    </div>
    <div class="graph-image" v-html="graphImage"></div>
  </div>
</template>

<script>
export default {
  name: 'graph',
  data () {
    return {
      graphBaseUrl: '//waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS',
      graphImage: undefined,
      loadingGraph: false
    }
  },
  props: {
    radioDateType: {
      type: String,
      required: false,
      default: 'period'
    },
    selected: {
      type: String,
      required: false
    },
    startDate: {
      required: true
    },
    endDate: {
      type: [String, Date],
      required: false,
      default: new Date().toISOString().split('T')[0] // today
    },
    graphType: {
      type: String,
      required: false,
      default: '00060' // defaults to cfs
    },
    period: {
      type: Number,
      required: false,
      default: 7
    }
  },
  watch: {
    selected: 'displayGraph'
  },
  methods: {
    displayGraph: function () {
      if (!this.selected) return
      // display a graph of the flow
      // TODO: catch error for undefined params
      //       effects: Pecas at Pecos river 08419000
      //       parm_cd=00060 (cfs) or 00065 (guage height ft)
      var vm = this;
      var image;
      var start = vm.startDate;
      var end = vm.endDate;
      // NOTE: usgs documentation is incorrect 'startDt' is 'begin_date'
      var graphUrl = vm.graphBaseUrl + '&parm_cd=' + vm.graphType + '&site_no=' + vm.selected;

      // TODO: look at computing this in Riverflow
      if (typeof (vm.startDate) === 'object') {
        start = vm.startDate.toISOString().split('T')[0]
      }

      if (typeof (vm.endDate) === 'object') {
        end = vm.endDate.toISOString().split('T')[0]
      }

      // period of days
      if (vm.radioDateType === 'period') {
        graphUrl = graphUrl + '&period=' + vm.period;
      }

      // add start and end
      if (vm.radioDateType === 'date' && start) {
        graphUrl = graphUrl + '&begin_date=' + start + '&end_date=' + end;
      }

      image = '<img src="' + graphUrl + '"class="graph" alt="USGS Water-data graph">';

      // reset the graph and show / hide loading
      vm.graphImage = undefined;
      vm.loadingGraph = true;

      var newImage = new Image();
      newImage.src = graphUrl;
      newImage.onload = function (e) {
        vm.graphImage = image;
        vm.loadingGraph = false;
      }

      return image;
    }
  }
}
</script>

<style lang="sass">
// unable to scope
.graph
  image-rendering: pixelated
  height: auto
  max-height: 500px
  min-width: 400px
  width: 100%

.graph-wrapper
  position: relative
  text-align: center
  display: flex
  align-items: center
  justify-content: center
  height: 100%

.graph-loading
  flex: 1
</style>
