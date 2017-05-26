<template>
  <table class="table" v-if="filteredData.length">
    <thead>
      <tr>
        <th v-for="key in columns"
          @click="sortBy(key)"
          :class="{ active: sortKey == key }">
          {{ key | capitalize }}
          <span class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
          </span>
        </th>
        <th>Class</th>
        <th>Time</th>
        <th>Map</th>
      </tr>
    </thead>
    <tfoot>
      <tr>
        <th>River Name</th>
        <th><abbr title="cubic feet per second">CFS</abbr></th>
        <th>Class</th>
        <th>Time</th>
        <th>Map</th>
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
          <span :class="river.rising ? 'arrow-up' : 'arrow-down'"></span>
        </td>
        <td class="wwclass">{{ river.class }}</td>
        <td>
          <span class="date">{{ river.date }}</span>
          <span class="time">{{ river.time }}</span>
        </td>
        <td>
          <a :href="river.location">Gauge</a>
        </td>
      </tr>
      <tr class="row-details">
        <td colspan="5">
          <div class="row-details-wrapper columns">
            <div class="column column-condition is-one-quarter">
              <p>{{ river.condition }}</p>
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
</template>

<script>
import Graph from '@/components/Graph'

export default {
  name: 'gridtable',
  props: {
    data: Array,
    columns: Array,
    filterKey: String,
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

// arrows
.arrow-up
  width: 0
  height: 0
  display: inline-block;
  border-left: 6px solid transparent
  border-right: 6px solid transparent
  border-bottom: 10px solid $green

.arrow-down
  width: 0
  height: 0
  display: inline-block;
  border-left: 6px solid transparent
  border-right: 6px solid transparent
  border-top: 10px solid $red
// sort arrows
th.active .arrow
  opacity: 1

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

</style>
