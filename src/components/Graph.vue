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
      required: true
    },
    selected: {
      type: String,
      required: true
    },
    startDate: {
      required: true
    },
    endDate: {
      type: [String, Date],
      required: true
    },
    graphType: {
      type: String,
      required: false
    },
    period: {
      type: Number,
      required: true,
      default: 7
    }
  },
  watch: {
    selected: 'displayGraph'
  },
  methods: {
    displayGraph: function () {
      // display a graph of the flow
      // TODO: catch error for undefined params
      //       effects: Pecas at Pecos river 08419000
      //       parm_cd=00060 (cfs) or 00065 (guage height ft)
      var image;
      var vm = this;
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

<style lang="scss">
  // unable to scope
  .graph {
    image-rendering: pixelated;
    height: auto;
    width: 100%;
  }

  .graph-wrapper {
    text-align: center;
  }
</style>
