<template>
  <div class="intro">
    <p>Select a river to get the latest flow rate, a graph of flow history, and photos. Search by a period of days from today (default is <span class="period">{{ period }}</span>) or a date range.</p>
  </div>
</template>

<script>
export default {
  name: 'intro',
  props: {
    period: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">

</style>
