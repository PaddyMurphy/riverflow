<template>
  <div class="riverflow">
    <div class="header">
      <h1 class="title">Riverflow</h1>
      <p class="tagline">Texas Edition</p>
    </div>

    <div class="select-river-wrapper">
      <select class="select-river" v-model="selected" @change="changeRiver">
        <option v-for="option in options" :value="option.value" :disabled="option.value === '' ? true : false">
          {{ option.text }}
        </option>
      </select>
    </div>

    <div class="graph-options">
      <div class="graph-controls-menu">
        <label class="graph-radio-label">
          <input type="radio" id="radio-dates-period" value="period" v-model="radioDateType">
          <span class="radio-title">Search by number of days &nbsp;</span>

          <input class="graph-period" type="number" min="7" max="90" v-model="period" v-show="radioDateType === 'period'">
        </label>
        <label class="graph-radio-label">
          <input type="radio" id="radio-dates-date" value="date" v-model="radioDateType">
          <span>Search by a date range</span>
        </label>
      </div>

      <label class="graph-control-label" v-show="radioDateType === 'date'">
        <span class="label-name">start date</span>
        <input class="graph-start" type="text" v-model="startDate" placeholder="Pick a start date">
      </label>

      <label class="graph-control-label" v-show="radioDateType === 'date'">
        <span class="label-name">end date</span>
        <input class="graph-end" type="text" v-model="endDate">
      </label>

      <!-- <input class="" value="Search" type="button" @click="getUsgsData" v-show="latestCfs == null ? false : true"> -->
    </div>

    <div class="error" v-if="error">{{ error }}</div>

    <div class="condition-wrapper">
      <div class="latest-cfs" v-if="latestCfs">

        <div class="rate-group">
          <span class="rate">{{ latestCfs }}</span>
          <abbr class="rate-abbr" title="cubic feet per second">CFS</abbr>
        </div>

        <a v-bind:href="mapUrl" v-if="mapUrl">Location of guage</a>
        <div class="time-group">
          <span v-if="latestDate">{{ latestDate }} at {{ latestTime }}</span>
        </div>
      </div>

      <div class="conditions" v-if="condition">{{ condition }}</div>

      <div class="history" v-if="history.length > 1">
        <h4 class="history-title">History</h4>
        <ul class="time-history">
          <li v-for="item in history">
            <b>{{ item.cfs }}</b> <abbr class="cfs" title="cubic feet per second">cfs</abbr> <span class="name">{{ item.name }}</span> <small>{{ item.date }} at {{ item.time }}</small>
          </li>
        </ul>
      </div>
    </div>

    <div class="graph-wrapper" v-html="graphImage">loading...</div>

    <footer>
      created by <a href="//mountaindrawn.com">mountaindrawn.com</a>
      <input type="color" class="color-picker" @change="selectBackground">
      <small class="color-value">{{backgroundColor}}</small>
    </footer>

  </div> <!-- END riverflow -->
</template>

<script>
import axios from 'axios'
import Flatpickr from 'flatpickr'
import rivers from 'rivers.json'
import conditions from 'conditions.json'

export default {
  name: 'riverflow',
  data () {
    return {
      backgroundColor: null,
      condition: null,
      error: null,
      graphImage: null,
      latestCfs: null,
      latestDate: null,
      latestTime: null,
      latitude: null,
      loading: false,
      loadingEl: document.querySelector('.loading'),
      longitude: null,
      mapUrl: null,
      period: 7, // days
      siteName: null,
      startDate: null,
      endDate: new Date().toISOString().split('T')[0], // todays date YYYY-MM-DD
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/?format=json&period=P1D',
      graphBaseUrl: '//waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS',
      graphType: '00060', // defaults to cfs
      STORAGE_KEY: 'riverflow-history',
      selected: 'selectRiver',
      baseMapUrl: '//maps.google.com/?q=',
      options: rivers.data,
      history: [],
      radioDateType: 'period'
    }
  },
  mounted: function () {
    var vm = this;
    // set selected river and fetch if routed from url
    if (this.$route.name === 'RiverflowUrl') {
      this.setSelectedRiver(this.$route.params.river);
    }

    this.fetchHistory();

    new Flatpickr(this.$el.querySelector('.graph-start'), { // eslint-disable-line
      maxDate: vm.endDate
    });
    new Flatpickr(this.$el.querySelector('.graph-end'), { // eslint-disable-line
      maxDate: vm.endDate
    });
  },
  watch: {
    selected: 'getUsgsData',
    loading: 'toggleLoading'
  },
  methods: {
    setSelectedRiver: function (river) {
      var vm = this;
      // set the selected option
      this.options.forEach(function (option, i) {
        if (vm.formatRiverName(option.text) === river) {
          vm.selected = option.value;
        }
      });
    },
    changeRiver: function (e) {
      this.selected = e.target[e.target.selectedIndex].value;
    },
    getUsgsData: function () {
      // // fetches usgs instant data, usgs graph service
      var vm = this;
      var fullUrl = this.valueBaseUrl + '&parameterCd=' + this.graphType + '&sites=' + this.selected;

      // do not submit if it's the select message
      if (this.selected === 'selectRiver' || !this.selected) {
        return;
      }

      this.loading = true;

      // fetch data
      axios.get(fullUrl)
        .then(function (response) {
          vm.loading = false;

          if (response.data.value.timeSeries[0]) {
            vm.displayUsgsData(response.data.value.timeSeries[0]);
            vm.displayGraph();
            vm.error = null;
          } else {
            vm.error = 'no river data available';
          }
          // TODO: set the url
        })
        .catch(function (error) {
          console.error(error.message);
          vm.loading = false;
          vm.error = error.message;
        });
    },
    displayUsgsData: function (response) {
      var values = response.values;
      // the last item in the first object is the last value
      var orderedValues = values[0].value.reverse()[0];
      var date = new Date(orderedValues.dateTime);

      // set values
      this.latestCfs = orderedValues.value;
      this.siteName = response.sourceInfo.siteName;
      this.latitude = response.sourceInfo.geoLocation.geogLocation.latitude;
      this.longitude = response.sourceInfo.geoLocation.geogLocation.longitude;
      // timestamp of data
      this.latestDate = date.toDateString();
      this.latestTime = date.toLocaleTimeString();
      // save data for history
      this.addHistory();
      // display conditions
      this.displayConditions(parseInt(this.latestCfs, 10));
      // create map link
      this.mapUrl = this.baseMapUrl + this.latitude + ',+' + this.longitude;
    },
    displayGraph: function () {
      // display a graph of the flow
      // TODO: catch error for undefined params
      //       effects: Pecas at Pecos river 08419000
      //       parm_cd=00060 (cfs) or 00065 (guage height ft)
      var image;
      // NOTE: usgs documentation is incorrect 'startDt' is 'begin_date'
      var graphUrl = this.graphBaseUrl + '&parm_cd=' + this.graphType + '&site_no=' + this.selected;

      // period of days
      if (this.radioDateType === 'period') {
        graphUrl = graphUrl + '&period=' + this.period;
      }

      // add start and end
      if (this.radioDateType === 'date' && this.startDate) {
        graphUrl = graphUrl + '&begin_date=' + this.startDate + '&end_date=' + this.endDate;
      }

      image = '<img src="' + graphUrl + '"class="graph" alt="USGS Water-data graph">';

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
    },
    fetchHistory: function () {
      var historyItems = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      var vm = this;

      historyItems.forEach(function (item, index) {
        vm.history.push(item);
      })

      return this.history
    },
    saveHistory: function (history) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    },
    addHistory: function () {
      // limit to 7, remove oldest
      if (this.history.length >= 7) {
        this.history.pop();
      }
      // create history object
      this.history.unshift({
        cfs: this.latestCfs,
        name: this.siteName,
        time: this.latestTime,
        date: this.latestDate
      });

      this.saveHistory(this.history);
    },
    removeHistory: function (item) {
      this.history.splice(this.history.indexOf(item), 1);
    },
    selectBackground: function (e) {
      this.backgroundColor = e.target.value;
      document.body.style.backgroundColor = e.target.value;
    },
    toggleLoading: function () {
      var style = this.loading === true ? 'flex' : 'none';
      this.loadingEl.style.display = style;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  @import '../assets/scss/riverflow.scss';
</style>
