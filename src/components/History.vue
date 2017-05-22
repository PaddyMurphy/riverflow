<template>
  <div class="history" v-show="history.length > 1">
    <h4 class="history-title">{{ title }}</h4>
    <ul class="time-history">
      <li v-for="item in history">
        <b>{{ item.cfs }}</b> <abbr class="cfs" title="cubic feet per second">cfs</abbr> <span class="name">{{ item.name }}</span> <small>{{ item.date }} at {{ item.time }}</small>
      </li>
    </ul>
  </div>
</template>

<script>
// import axios from 'axios';

export default {
  name: 'history',
  data () {
    return {
      title: 'History',
      history: [],
      STORAGE_KEY: 'riverflow-history'
    }
  },
  props: {
    latestCfs: {
      type: String,
      required: true
    },
    siteName: {
      type: String,
      required: true
    },
    latestTime: {
      type: String,
      required: true
    },
    latestDate: {
      type: String,
      required: true
    }
  },
  mounted: function () {
    this.fetchHistory();
  },
  watch: {
    latestCfs: 'addHistory'
  },
  methods: {
    fetchHistory: function () {
      var vm = this;

      var historyItems = JSON.parse(window.localStorage.getItem(this.STORAGE_KEY) || '[]');

      historyItems.forEach(function (item, index) {
        vm.history.push(item);
      })

      return this.history
    },
    saveHistory: function (history) {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
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
    }
  }
}
</script>

<style lang="scss">

</style>
