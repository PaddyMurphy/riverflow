<template>
  <div class="riverflow">
    <div class="select-river-wrapper">
      <el-select class="select-river" v-model="selected" @change="changeRiver">
        <el-option
          v-for="option in options"
          :value="option.value"
          :label="option.text"
          :disabled="option.value === '' ? true : false"
        >
        </el-option>
      </el-select>

      <el-collapse class="graph-options">
        <el-collapse-item title="Search options" name="1">
          <div class="graph-controls-menu">
              <el-radio id="radio-dates-period" label="period" v-model="radioDateType">Search by number of days</el-radio>

              <el-input-number
                class="graph-period"
                type="number"
                :min="7"
                :max="90"
                v-model="period"
                v-show="radioDateType === 'period'"
              ></el-input-number>

              <el-radio id="radio-dates-date" label="date" v-model="radioDateType">Search by a date range</el-radio>
          </div>

          <label class="graph-control-label" v-show="radioDateType === 'date'">
            <span class="label-name">start date</span>
            <!-- TODO: implement disabledDate -->
            <el-date-picker
              class="graph-start"
              type="date"
              v-model="startDate"
              placeholder="Pick a start date"
            ></el-date-picker>
          </label>

          <label class="graph-control-label" v-show="radioDateType === 'date'">
            <span class="label-name">end date</span>
            <el-date-picker
              class="graph-end"
              type="date"
              v-model="endDate"
            ></el-date-picker>
          </label>
        </el-collapse-item>
      </el-collapse>
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

      <div class="intro" v-if="!latestCfs">
        <p>Select a river to get the latest flow rate, a graph of flow history, and photos. Search by a period of days from today (default is 7) or a date range.</p>
      </div>

      <history
        :latestCfs="latestCfs"
        :siteName="siteName"
        :latestTime="latestTime"
        :latestDate="latestDate"
      />
    </div>

    <graph
      :radioDateType="radioDateType"
      :selected="selected"
      :startDate="startDate"
      :endDate="endDate"
      :graphType="graphType"
      :period="period"
      v-show="selectedText"
    />

    <photos
      :siteName="selectedText"
      v-show="selectedText">
    </photos>

    <footer>
      created by <a href="//mountaindrawn.com">mountaindrawn.com</a>
      <input type="color" class="color-picker" @change="selectBackground" value="#E0E4CC">
      <small class="color-value">{{backgroundColor}}</small>
    </footer>

  </div> <!-- END riverflow -->
</template>

<script>
import axios from 'axios'
import rivers from 'rivers.json'
import conditions from 'conditions.json'
import Photos from 'components/Photos'
import Graph from 'components/Graph'
import History from 'components/History'

export default {
  name: 'riverflow',
  data () {
    return {
      backgroundColor: null,
      baseMapUrl: '//maps.google.com/?q=',
      condition: null,
      endDate: new Date().toISOString().split('T')[0], // todays date YYYY-MM-DD
      error: null,
      graphType: '00060', // defaults to cfs
      latestCfs: '',
      latestDate: '',
      latestTime: '',
      latitude: null,
      loading: false,
      loadingEl: document.querySelector('.loading'),
      longitude: null,
      mapUrl: null,
      options: rivers.data,
      period: 7, // days
      radioDateType: 'period',
      selected: 'selectRiver',
      selectedText: null,
      showSearchOptions: false,
      siteName: '',
      startDate: null,
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/'
    }
  },
  components: {
    'photos': Photos,
    'graph': Graph,
    'history': History
  },
  mounted: function () {
    // var vm = this;
    // set selected river and fetch if routed from url
    if (this.$route.name === 'RiverflowUrl') {
      this.setSelectedRiver(this.$route.params.river);
    }
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
    changeRiver: function (value) {
      var vm = this;

      this.selected = value;
      // get text from value and set the selected option
      this.options.forEach(function (option, i) {
        if (option.value === value) {
          vm.selectedText = option.text;
        }
      });
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

      // display conditions
      this.displayConditions(parseInt(this.latestCfs, 10));
      // create map link
      this.mapUrl = this.baseMapUrl + this.latitude + ',+' + this.longitude;
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
