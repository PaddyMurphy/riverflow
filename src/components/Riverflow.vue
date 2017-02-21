<template>
  <div class="riverflow">
    <div class="loading" v-if="loading">Loading...</div>
    <div class="error" v-if="error">Error loading river information</div>
    <div class="header">
      <h1>Riverflow</h1>
      <p>Texas Edition</p>
    </div>

    <select v-model="selected" @change="getUsgsData">
      <option v-for="option in options" v-bind:value="option.value">
          {{ option.text }}
        </option>
    </select>

    <div class="latestCfs" v-if="latestCfs">
      <h2>
        <span class="rate">{{ latestCfs }}</span>
        <abbr class="rateCfs" title="cubic feet per second">CFS</abbr>
      </h2>

      <a v-bind:href="mapUrl" v-if="mapUrl">View a Map</a>

      <div v-if="latestTime">{{ latestTime }}</div>
    </div>

    <div class="conditions" v-if="condition">{{ condition }}</div>

    <div class="graph" v-if="graphImage" v-html="graphImage"></div>

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
      riverId: null,
      siteName: null,
      selected: 'selectRiver',
      baseMapUrl: '//maps.google.com/?q=',
      flickrApiKey: '6c6069e831fb567b86c7d9b75c82624f',
      options: rivers.data
    }
  },
  methods: {
    getUsgsData: function (e) {
      // fetches usgs instant data, usgs graph service
      var baseUrl = 'https://waterservices.usgs.gov/nwis/iv/?format=json&period=P7D&sites=';
      var params = '&parameterCd=00060';
      var riverLocation = e.target[e.target.selectedIndex].value;
      var fullUrl = baseUrl + riverLocation + params;
      var that = this;

      // do not submit if it's the select message
      if (riverLocation === 'selectRiver' || !riverLocation) {
        return;
      }

      this.riverId = riverLocation;
      this.loading = true;
      // load graph
      this.displayGraph();
      // fetch data
      axios.get(fullUrl)
        .then(function (response) {
          that.loading = false;
          that.error = null;
          that.displayUsgsData(response.data.value.timeSeries[0]);
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
      var graphUrl = '//waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&parm_cd=00060&site_no=' + this.riverId + '&period=7';
      var image = '<img src="' + graphUrl + '"id="graph" alt="USGS Water-data graph">';

      this.graphImage = image;
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
      } else {
        console.error('no flow rate conditions met. flowRate = ' + flowRate);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
}

h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}

select {
  background: #fff;
  font-size: 150%;
  width: 100%;
}

.conditions {
  margin: 1em 0;
}
</style>
