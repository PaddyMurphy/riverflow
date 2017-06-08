<template>
  <div class="gridtable">

    <svg style="display: none;">
      <symbol viewBox="0 0 27 30" version="1.1">
        <g id="arrow-flow">
            <polygon points="21.6 29.4545455 5.4 29.4545455 5.4 16.2 0 16.2 13.5 0 27 16.2 21.6 16.2"></polygon>
        </g>
      </symbol>
    </svg>

    <div v-show="loading" class="loading notification is-warning">Loading river information...</div>

    <table class="table" v-show="filteredData.length">
      <thead>
        <tr>
          <th v-for="key in columns"
            @click="sortBy(key)"
            :class="[{ active: sortKey == key}, key]">
            {{ key | capitalize }}
            <span class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
            </span>
          </th>
          <th class="th-class">Class</th>
          <th class="th-time">Time</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>River Name</th>
          <th><abbr title="cubic feet per second">CFS</abbr></th>
          <th class="th-class">Class</th>
          <th class="th-time">Time</th>
        </tr>
      </tfoot>
      <tbody v-for="river in filteredData">
        <tr :class="river.level"
          :data-selected="river.site"
          @click="selectRiver"
        >
          <th>{{ river.name }}</th>
          <td>
            {{ river.cfs }}

            <svg
              viewBox="0 0 27 30"
              :class="[
                river.rising ? 'arrow-up' : 'arrow-down',
                river.risingFast ? 'is-rising-fast' : ''
              ]"
            >
              <use xlink:href="#arrow-flow" />
            </svg>
          </td>
          <td class="wwclass">{{ river.class }}</td>
          <td>
            <span class="date" v-if="river.date">{{ river.date }}</span>
            <span class="time">{{ river.time }}</span>
          </td>
        </tr>
        <tr class="row-details">
          <td colspan="5">
            <div class="row-details-wrapper columns">
              <div class="column column-condition is-one-quarter">
                <div class="content">
                  <p class="sitecode">
                    <a class="button site-link" :href="river.location" target="blank">USGS site {{ river.site }} location</a>
                  </p>
                  <p>{{ river.condition }}</p>
                  <p class="small">NOTE: The rising / falling arrows compare the current value to the value 12 hours ago. The river may already be on the way down</p>
                </div>
              </div>
              <div class="column column-graph is-three-quarters">
                <graph
                  :selected="selected"
                  :startDate="startDate"
                  :endDate="endDate"
                  :graphType="graphType"
                  v-show="selected"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Graph from '@/components/Graph'

export default {
  name: 'gridtable',
  props: {
    data: Array,
    columns: Array,
    filterKey: String,
    loading: Boolean,
    graphType: String
  },
  data () {
    let sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })

    return {
      endDate: new Date().toISOString().split('T')[0],
      error: false,
      selected: undefined,
      sortKey: 'name',
      sortOrders: sortOrders,
      startDate: undefined
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
    },
    filteredData: function () {
      var sortKey = this.sortKey
      var filterKey = this.filterKey && this.filterKey.toLowerCase()
      var order = this.sortOrders[sortKey] || 1
      var data = this.data
      if (filterKey) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          })
        })
      }
      if (sortKey) {
        if (sortKey === 'cfs') {
          // sort by number
          data = data.slice().sort(function (a, b) {
            a = a[sortKey]
            b = b[sortKey]
            return (a - b) * order
          })
        } else {
          // sort by string
          data = data.slice().sort(function (a, b) {
            a = a[sortKey]
            b = b[sortKey]
            return (a === b ? 0 : a > b ? 1 : -1) * order
          })
        }
      }
      return data
    }
  },
  components: {
    'graph': Graph
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  mounted: function () {
    // TODO: set selected river and fetch if routed from url
    // if (this.$route.name === 'RivertableUrl') {}
  },
  methods: {
    sortBy: function (key) {
      this.resetTable();
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    },
    selectRiver: function (e) {
      const target = e.currentTarget;

      // deselect if clicking the active row
      if (target.classList.contains('is-selected')) {
        this.resetTable();
        this.selected = undefined;
      } else {
        this.resetTable();
        // set selected
        target.classList.add('is-selected');
        this.selected = target.dataset.selected;
        // expand next row
        target.nextElementSibling.classList.add('show-row');
      }
    },
    resetTable: function () {
      const selected = this.$el.querySelector('tr.is-selected');
      const rowDetailsShown = this.$el.querySelector('.show-row');
      // remove existing selected
      if (selected) {
        selected.classList.remove('is-selected');
        rowDetailsShown.classList.remove('show-row');
      }
    }
  }
}
</script>

<style scoped lang="sass">
// import initial variables
@import '../../node_modules/bulma/sass/utilities/initial-variables'
// import custom variables
@import '../assets/scss/bulma-styles.sass'

.loading
  text-align: center

.tools
  margin-bottom: 1rem

.table tr:not(.row-details)
  transition: background-color 0.25s ease-out
  &:hover
    cursor: pointer

.date,
.time
  font-size: 0.8rem

// table
.row-details
  display: none

// TODO: animating to max-height doesn't expand beyond
.row-details-wrapper
  // max-height: 0
  // animation: grow 0.5s ease-out forwards

.row-details-wrapper.show-row
  // max-height: 70vh

@keyframes grow
  0%
    max-height: 0

  100%
    max-height: 70vh

.show-row
  display: table-row

// table row colors
.level-0
  background-color: lighten($red, 10%)

.level-1
  background-color: lighten($red, 20%)

.level-2
  background-color: lighten($red, 30%)

.level-3
  background-color: lighten($green, 40%)

.level-4
  background-color: lighten($green, 30%)

.level-5
  background-color: lighten($green, 20%)

.level-6
  background-color: lighten($green, 10%)

.small
  font-size: $size-7

.site-link
  height: auto
  white-space: normal

// svg arrows indicating rise/fall
.arrow-up,
.arrow-down
  width: auto
  height: 15px

.arrow-up
  fill: darken($green, 8%)
  transform: translateY(2px)

.arrow-down
  fill: darken($red, 8%)
  transform: scale(-1) translateY(-2px)

.is-rising-fast
  animation: pulse 1.3s linear infinite;

@keyframes pulse
  0%
    transform: translateY(2px)
  50%
    transform: translateY(-4px)
  100%
    transform: translateY(2px)


// table sorting sort arrows
th.active .arrow
  opacity: 1

.cfs
  min-width: 4.5rem
  text-transform: uppercase

.arrow
  display: inline-block
  vertical-align: middle
  width: 0
  height: 0
  margin-left: 5px
  opacity: 0.66

.arrow.asc
  border-left: 4px solid transparent
  border-right: 4px solid transparent
  border-bottom: 4px solid $blue

.arrow.dsc
  border-left: 4px solid transparent
  border-right: 4px solid transparent
  border-top: 4px solid $blue

@media only screen and (max-width: 768px)
  .th-class,
  .th-time
    font-size: 0.8rem;
    vertical-align: bottom;

</style>
