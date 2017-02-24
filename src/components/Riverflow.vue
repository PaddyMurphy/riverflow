<template>
  <div class="riverflow">
    <div class="loading" v-if="loading">Loading...</div>
    <div class="error" v-if="error">Error loading river information</div>

    <div class="header">
      <h1 class="title">Riverflow</h1>
      <p class="tagline">Texas Edition</p>
    </div>

    <div class="select-river-wrapper">
      <select class="select-river" v-model="selected" @change="changeRiver">
        <option v-for="option in options" v-bind:value="option.value">
            {{ option.text }}
          </option>
      </select>
    </div>

    <div class="condition-wrapper">
      <div class="latest-cfs" v-if="latestCfs">

        <div class="rate-group">
          <span class="rate">{{ latestCfs }}</span>
          <abbr class="rate-abbr" title="cubic feet per second">CFS</abbr>
        </div>

        <a v-bind:href="mapUrl" v-if="mapUrl">Location of guage</a>
        <div class="time-group">
          <span v-if="latestTime">{{ latestTime }}</span>
          <ul class="time-history" v-if="timeHistory.length">
            <li v-for="time in timeHistory">{{ time }}</li>
          </ul>
        </div>
      </div>

      <div class="conditions" v-if="condition">{{ condition }}</div>
    </div>

    <div class="graph-wrapper" v-if="graphImage" v-html="graphImage"></div>

  </div> <!-- END riverflow -->
</template>

<script>
import axios from 'axios'
import rivers from 'rivers.json'
import conditions from 'conditions.json'

export default {
  name: 'riverflow',
  data () {
    return {
      condition: null,
      error: null,
      graphImage: null,
      latestCfs: null,
      latestTime: null,
      latitude: null,
      loading: false,
      longitude: null,
      mapUrl: null,
      siteName: null,
      selected: 'selectRiver',
      baseMapUrl: '//maps.google.com/?q=',
      options: rivers.data,
      timeHistory: []
    }
  },
  mounted: function () {
    // set selected river and fetch if routed from url
    if (this.$route.name === 'RiverflowUrl') {
      this.setSelectedRiver(this.$route.params.river);
    }
  },
  watch: {
    selected: 'getUsgsData'
  },
  methods: {
    setSelectedRiver: function (river) {
      var that = this;
      console.log('setSelectedRiver: ' + river);
      // set the selected option
      this.options.forEach(function (option, i) {
        if (that.formatRiverName(option.text) === river) {
          that.selected = option.value;
        }
      });
    },
    changeRiver: function (e) {
      this.selected = e.target[e.target.selectedIndex].value;
    },
    getUsgsData: function () {
      // // fetches usgs instant data, usgs graph service
      var baseUrl = 'https://waterservices.usgs.gov/nwis/iv/?format=json&period=P7D&sites=';
      var params = '&parameterCd=00060';
      var fullUrl = baseUrl + this.selected + params;
      var that = this;

      // do not submit if it's the select message
      if (this.selected === 'selectRiver' || !this.selected) {
        return;
      }

      this.loading = true;
      // load graph
      this.displayGraph();
      // fetch data
      axios.get(fullUrl)
        .then(function (response) {
          that.loading = false;
          that.error = null;
          that.displayUsgsData(response.data.value.timeSeries[0]);
          // TODO: set the url
        })
        .catch(function (error) {
          console.error(error.message);
          that.loading = false;
          that.error = error.message;
        });
    },
    displayUsgsData: function (response) {
      var orderedValues = response.values[0].value.reverse()[0];
      var date = new Date(orderedValues.dateTime);

      // set values
      this.latestCfs = orderedValues.value;
      this.siteName = response.sourceInfo.siteName;
      this.latitude = response.sourceInfo.geoLocation.geogLocation.latitude;
      this.longitude = response.sourceInfo.geoLocation.geogLocation.longitude;
      // build date
      this.latestTime = date.toDateString() + ' at ' + date.toLocaleTimeString();
      // display conditions
      this.displayConditions(parseInt(this.latestCfs, 10));
      // create map link
      this.mapUrl = this.baseMapUrl + this.latitude + ',+' + this.longitude;
    },
    displayGraph: function () {
      // display a graph of the flow
      var graphUrl = '//waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&parm_cd=00060&site_no=' + this.selected + '&period=7';
      var image = '<img src="' + graphUrl + '"class="graph" alt="USGS Water-data graph">';

      this.graphImage = image;

      return image;
    },
    displayConditions: function (flowRate) {
      // check the range of the cfs and display the appropriate message
      if (flowRate === 0) {
        this.condition = conditions.flow0;
      } else if ((flowRate > 0) && (flowRate < 50)) {
        this.condition = conditions.flow1;
      } else if ((flowRate >= 50) && (flowRate < 100)) {
        this.condition = conditions.flow2;
      } else if ((flowRate >= 100) && (flowRate < 300)) {
        this.condition = conditions.flow3;
      } else if ((flowRate >= 300) && (flowRate < 600)) {
        this.condition = conditions.flow4;
      } else if ((flowRate >= 600) && (flowRate < 2000)) {
        this.condition = conditions.flow5;
      } else if (flowRate >= 2000) {
        this.condition = conditions.flow6;
      }

      return this.condition;
    },
    formatRiverName: function (name) {
      // parse the option text (San Marcos River : Luling)
      // to this (sanmarcos:luling)
      var formatted = name;
      formatted = formatted.toLowerCase();
      formatted = formatted.replace(/ /g, ''); // replace spaces
      formatted = formatted.replace(/(\r\n|\n|\r)/gm, '');// remove line breaks
      formatted = formatted.replace(/-(\S*)-/g, ''); // exclude titles (i.e. --brazosriverbasin--)

      return formatted;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
$orange: #fa6900;
$orange-light: lighten(#fa6900, 15%);

.header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

:root .title, .tagline {
  margin: 1em;
}

.title {
  font-size: 1.2em;
}

.tagline {
  font-size: 1em;
}

.select-river-wrapper {
  padding: 0 1em;
}

select {
  background: #fff;
  font-size: 1.5em;
  width: 100%;
}

.condition-wrapper {
  display: flex;
  margin: 1em;
}

.latest-cfs {
  text-align: center;
  width: 50%;
}

.rate-group {
  align-items: baseline;
  display: flex;
  justify-content: center;
}

.rate {
  color: $orange;
  font-weight: bold;
  font-size: 4em;
}

.rate-abbr {
  color: $orange-light;
  font-size: 2em;
  font-weight: bold;

  &[title] {
    border-bottom: 1px dotted;
  }
}

.conditions {
  padding-left: 1em;
  width: 50%;
}

.graph-wrapper {
  text-align: center;
}

.error, .loading {
  background: rgba(255,255,255,0.9);
  font-size: 1.2em;
  padding: 1em;
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>
