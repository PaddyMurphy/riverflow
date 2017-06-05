<!--
Rivertable: display all desirable rivers and creeks
- esdocs - add comments
- Display: Name, cfs, date, whitewater class, location, color rows to indicate flow
- Color rows: use default conditions UNLESS OVERRIDEN
- Click row: expand below with river details: desc, graph, photos
TODO:
- add photos in details row
- optimize for mobile
- add overrides for default condtions
-->
<template>
  <div class="rivertable">
    <section class="section">
      <div class="container">
        <div v-if="error" class="notification is-danger">
          <button class="delete" @click="error = undefined"></button>
          {{ error }}
        </div>
        <div class="columns is-flex tools">

          <div class="column column-search is-three-quarters">
            <div class="field level-item">
              <label class="label">Search</label>
              <p class="control">
                <input name="query" v-model="searchQuery" class="input" type="text" placeholder="Filter the table">
                <a class="delete is-small" @click="searchQuery = ''"></a>
              </p>
            </div>
          </div>

          <div class="column column-button is-one-quarter">
            <button :class="{ 'is-loading' : loading }" class="button is-primary" @click="getUsgsData">refresh river data</button>
          </div>
        </div>

        <grid-table
          :data="riversFormatted"
          :columns="columns"
          :filter-key="searchQuery"
          :loading="loading"
          :graphType="graphType">
        </grid-table>
      </div>
    </section>
  </div> <!-- END rivertable -->
</template>

<script>
import axios from 'axios'
import Conditions from '@/conditions.json'
import GridTable from '@/components/GridTable'
import Rivers from '@/rivers.json'

export default {
  name: 'rivertable',
  data () {
    return {
      baseMapUrl: '//maps.google.com/?q=',
      baseUsgsUrl: 'https://waterservices.usgs.gov/nwis/iv/',
      columns: ['name', 'cfs'],
      error: false,
      graphType: '00060', // defaults to cfs
      loading: false,
      rivers: Rivers.data,
      riversFormatted: [],
      searchQuery: ''
    }
  },
  computed: {
    sites: function () {
      let list = [];

      this.rivers.forEach(function (d) {
        // return only number values
        if (d.value.match(/\d+/g)) {
          list.push(d.value);
        }
      });

      return list.join();
    }
  },
  components: {
    'grid-table': GridTable
  },
  watch: {
    '$route' (to, from) {
      // react to route changes...
      console.log(to);
    }
  },
  mounted: function () {
    // set selected river and fetch if routed from url
    // if (this.$route.name === 'RivertableUrl') {}
    // load the river data
    this.getUsgsData();
  },
  methods: {
    /**
     * Fetches usgs instant data from rivers.json.
     * @return {number[]} response
     */

    // NOTE somtimes fails 00060:
    // 08169845 Guad Gonzales
    // 08449100 Dolan creek
    // disabling catch error display
    getUsgsData: function () {
      var vm = this;

      vm.riversFormatted = [];
      vm.loading = true;
      // fetch all site numbers in rivers.json
      axios.get(this.baseUsgsUrl, {
        params: {
          parameterCd: this.graphType,
          sites: this.sites,
          format: 'json',
          period: 'PT12H', // past 12 hours
          siteStatus: 'active'
        }
      })
      .then(response => {
        vm.loading = false;
        if (response.data.value.timeSeries) {
          vm.displayUsgsData(response.data.value.timeSeries);
          vm.error = undefined;
        } else {
          vm.error = 'no river data available';
        }
      })
      .catch(error => {
        console.log(error);
        vm.loading = false;
        vm.error = error.message;
      });
    },
    /**
     * Formats usgs response for display from rivers.json.
     * @return {number[]} formatted response
     * @param {number[]} response - usgs fetch response.
     */
    displayUsgsData: function (response) {
      const vm = this;
      const today = new Date();
      let arr;
      let river = {};
      let currentValue;
      let date;
      let geo;
      let oldestValue;
      let newestValue;
      let percentChanged;
      let rising;
      let risingFast;
      let risingFastThreshold = 100; // 100% change is a double in cfs
      let site;
      let time;

      response.forEach(function (d, i) {
        // NOTE: some rivers do not support cfs (00060)
        arr = d.values[0].value;
        // return on error
        if (!arr[0]) return;

        // oldestValue is the first item
        oldestValue = parseInt(arr[0].value, 10);
        // currentValue is the last item
        currentValue = arr[arr.length - 1];
        newestValue = parseInt(currentValue.value, 10);
        // get current date / time
        date = new Date(currentValue.dateTime);
        time = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});

        percentChanged = Math.round((newestValue / oldestValue) * 100);

        // only show date if not today
        if (today.toDateString() === date.toDateString()) {
          date = '';
        }

        geo = d.sourceInfo.geoLocation.geogLocation;
        site = d.sourceInfo.siteCode[0].value;
        rising = (newestValue > oldestValue);
        risingFast = (percentChanged > risingFastThreshold);

        river = {
          'name': d.sourceInfo.siteName,
          'location': vm.baseMapUrl + geo.latitude + ',+' + geo.longitude,
          'site': site,
          'date': date,
          'time': time,
          'cfs': newestValue,
          'oldCfs': oldestValue,
          'condition': vm.getConditions(newestValue).condition,
          'level': vm.getConditions(newestValue).level,
          'rising': rising,
          'risingFast': risingFast
        }

        vm.mergeRiverInfo(river);
      });
    },
    /**
     * Merges class from rivers.json to matching response
     * matches are based on USGS site numbers
     * @param {Object} river
     */
    mergeRiverInfo: function (river) {
      const vm = this;
      const currentRiver = river.site;

      vm.rivers.forEach(function (d) {
        // add white water class
        if (d.value === currentRiver) {
          river.class = d.class;
        }
      });

      vm.riversFormatted.push(river);
    },
    /**
     * Returns condition description and level color code from conditions.json
     * @return {Object} condition and level
     * @param {number} cfs - from usgs fetch response.
     */
    getConditions: function (cfs) {
      let condition;
      let level;
      // convert to number
      cfs = parseInt(cfs, 10);
      // check the range of the cfs and display the appropriate message
      if (cfs === 0) {
        condition = Conditions.flow0;
        level = 'level-0'
      } else if ((cfs > 0) && (cfs < 50)) {
        condition = Conditions.flow1;
        level = 'level-1'
      } else if ((cfs >= 50) && (cfs < 100)) {
        condition = Conditions.flow2;
        level = 'level-2'
      } else if ((cfs >= 100) && (cfs < 300)) {
        condition = Conditions.flow3;
        level = 'level-3'
      } else if ((cfs >= 300) && (cfs < 600)) {
        condition = Conditions.flow4;
        level = 'level-4'
      } else if ((cfs >= 600) && (cfs < 2000)) {
        condition = Conditions.flow5;
        level = 'level-5'
      } else if (cfs >= 2000) {
        condition = Conditions.flow6;
        level = 'level-6'
      }

      return {'condition': condition, 'level': level};
    }
  }
}
</script>

<style scoped lang="sass">
// import initial variables
@import '../../node_modules/bulma/sass/utilities/initial-variables'
// import custom variables
@import '../assets/scss/bulma-styles.sass'

.tools
  margin-bottom: 1rem

.column-search
  min-width: 200px
  .field
    justify-content: flex-start
  label
    margin: 0 0.5rem

.columns
  flex-wrap: wrap

.column-button
  justify-content: flex-end

.delete
  position: absolute
  top: 0.6em
  right: 0.6rem

</style>
