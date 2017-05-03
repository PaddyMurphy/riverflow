<template>
  <div class="riverflow">

    <div class="select-river-wrapper">
      <!-- TODO: add filterable -->
      <el-select class="select-river" v-model="selected" @change="changeRiver" :placeholder="selectedText">
        <el-option
          v-for="option in options"
          :key="option.value"
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
    </div> <!-- END select-river-wrapper -->

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

      <conditions :latestCfs="latestCfs" />

      <intro :period="period" v-if="!latestCfs" />

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
      <!-- <el-color-picker v-model="backgroundColor" @change="selectBackground"></el-color-picker> -->
      <input type="color" class="color-picker" @change="selectBackground" value="#E0E4CC">
      <small class="color-value">{{backgroundColor}}</small>
    </footer>

  </div> <!-- END riverflow -->
</template>

<script>
import axios from 'axios'
import rivers from '@/rivers.json'
import Intro from '@/components/Intro'
import Conditions from '@/components/Conditions'
import Photos from '@/components/Photos'
import Graph from '@/components/Graph'
import History from '@/components/History'

export default {
  name: 'riverflow',
  data () {
    return {
      backgroundColor: undefined,
      baseMapUrl: '//maps.google.com/?q=',
      endDate: new Date().toISOString().split('T')[0], // todays date YYYY-MM-DD
      error: undefined,
      graphType: '00060', // defaults to cfs
      latestCfs: '',
      latestDate: '',
      latestTime: '',
      latitude: undefined,
      loading: false,
      loadingEl: document.querySelector('.loading'),
      longitude: undefined,
      mapUrl: undefined,
      options: rivers.data,
      period: 7, // days
      radioDateType: 'period',
      selected: 'selectRiver',
      selectedText: 'Select a river',
      showSearchOptions: false,
      siteName: '',
      startDate: undefined,
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/'
    }
  },
  components: {
    'intro': Intro,
    'conditions': Conditions,
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
      // clear filterable input
      vm.$el.querySelector('.el-input__inner').value = '';
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

      // create map link
      this.mapUrl = this.baseMapUrl + this.latitude + ',+' + this.longitude;
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
  // NOTE: webpack tests do not find nested includes
  // @import '../assets/scss/riverflow.scss';
  @import '../assets/scss/reset.scss';
  @import '../assets/scss/variables.scss';
  @import '../../node_modules/element-ui/lib/theme-default/index.css';

  .select-river-wrapper {
    display: flex;
    flex-direction: column;
    padding: 0 $default-padding $default-padding / 2;
  }

  .graph-options {
    border: 0;
    margin-top: 0;
    // override default styles
    .el-collapse-item__header,
    .el-collapse-item__wrap {
      background: none;
      border: 0;
    }
    // move 'Search options' to the right
    .el-collapse-item__header {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
    }

    .el-collapse-item__header__arrow {
      margin: 0 0.8em 0 0.5em;
    }

    .el-radio__label {
      cursor: pointer;
    }
  }

  .graph-controls-menu {
    display: flex;
    flex-wrap: wrap;
  }

  .graph-control-label {
    display: block;
    margin: 0 0 1em;
  }

  .graph-period {
    transform: translateY(-0.3em);
  }

  .graph-loading {
    padding: 1em 0;
  }

  #radio-dates-period,
  #radio-dates-date {
    cursor: pointer;
    display: flex; // keeps aligned to radio
    flex: 1 1 50%;
    margin: 0 auto 0.5em;
  }

  .label-name {
    display: inline-block;
    width: 8em;
  }

  .condition-wrapper {
    background: $conditions-color;
    display: flex;
    flex-wrap: wrap;
    padding: 1em;

    > div {
      flex: 1 1 33.3%;
      padding: 1em
    }
  }

  .latest-cfs {
    text-align: center;
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

  .time-history {
    font-size: 0.8em;
    margin: 0;
    padding: 0;

    li {
      list-style: none;
      padding: 0 0 .25em;
    }
    // hide the first once since the data is already displayed
    li:first-child {
      display: none !important;
    }

    .cfs {
      font-size: 0.8em;
      margin-left: -0.20em;
    }
  }

  .history-title {
    margin: 0 0 .25em;
  }

  footer {
    font-size: 0.8em;
    padding: $default-padding 0;
    text-align: center;
  }

  .color-picker {
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    opacity: 0.3;
    transition: opacity 0.25s;

    &:hover {
      opacity: 1;
    }
  }

  .loading {
    align-items: center;
    background: rgba(255,255,255,0.9);
    display: none;
    font-size: 1.2em;
    justify-content: center;
    padding-bottom: $default-padding;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 999;
  }

  .error {
    font-size: 1.2em;
    text-align: center;
    padding: $default-padding;
    width: 100%;
  }

  // transitions
  .fade-enter-active, .fade-leave-active {
    transition: all 0.35s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
  }
</style>
