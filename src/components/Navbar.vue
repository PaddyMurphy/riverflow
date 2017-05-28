<template>
  <header class="hero is-bold is-primary">
    <div class="container">
      <div class="header is-flex" v-once>
        <h1 class="title">{{ title }}</h1>
        <p class="tagline">{{ tagline }}</p>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'navbar',
  data () {
    return {
      title: 'Riverflow',
      tagline: 'Texas Edition'
    }
  }
}
</script>

<style scoped lang="sass">
@import '../assets/scss/bulma-styles.sass'

.header
  align-items: center
  justify-content: space-between

.title, .tagline
  margin: 1rem $default-padding

.tabs li:first-child
  padding-left: 1rem


</style>
