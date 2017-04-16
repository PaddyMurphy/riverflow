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

      <button class="btn-search-options" @click="toggleSearchOptions">search options</button>
    </div>

    <transition name="fade">
      <div class="graph-options" v-show="showSearchOptions">
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
    </transition>

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

      <div class="intro" v-if="!latestCfs">
        <p>Select a river to get the latest flow rate and graph of flow history. Search by a period of days from today (default is 7) or a date range.</p>
      </div>

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
      <input type="color" class="color-picker" @change="selectBackground" value="#E0E4CC">
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
      baseMapUrl: '//maps.google.com/?q=',
      condition: null,
      endDate: new Date().toISOString().split('T')[0], // todays date YYYY-MM-DD
      error: null,
      graphBaseUrl: '//waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS',
      graphImage: null,
      graphType: '00060', // defaults to cfs
      history: [],
      latestCfs: null,
      latestDate: null,
      latestTime: null,
      latitude: null,
      loading: false,
      loadingEl: document.querySelector('.loading'),
      longitude: null,
      mapUrl: null,
      options: rivers.data,
      period: 7, // days
      radioDateType: 'period',
      selected: 'selectRiver',
      showSearchOptions: false,
      siteName: null,
      startDate: null,
      STORAGE_KEY: 'riverflow-history',
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/'
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
    toggleSearchOptions: function () {
      if (this.showSearchOptions) {
        this.showSearchOptions = false;
      } else {
        this.showSearchOptions = true;
      }
    },
    getUsgsData: function () {
      // // fetches usgs instant data, usgs graph service
      var vm = this;

      // do not submit if it's the select message
      if (this.selected === 'selectRiver' || !this.selected) {
        return;
      }

      this.loading = true;

      // fetch data
      axios.get(this.valueBaseUrl, {
        params: {
          parameterCd: this.graphType,
          sites: this.selected,
          format: 'json',
          period: 'P1D'
        }
      })
      .then(response => {
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
      .catch(error => {
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
    selectBackground: function (e) {
      this.backgroundColor = e.target.value;
      // set the backgound color
      document.body.style.backgroundColor = e.target.value;

      // http://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
      var c = this.backgroundColor.substring(1); // strip #
      var rgb = parseInt(c, 16); // convert rrggbb to decimal
      var r = (rgb >> 16) & 0xff; // extract red
      var g = (rgb >> 8) & 0xff; // extract green
      var b = (rgb >> 0) & 0xff; // extract blue
      // adjust colors for perceived brightness
      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
      // adjust font color to backgound
      if (luma < 128) {
        document.body.style.color = '#fff';
      } else {
        document.body.style.color = '#000';
      }
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
