<template>
  <div>
    <nav class="nav">
      <router-link class="nav-item" to="/">
        Riverflow
      </router-link>
      <router-link class="nav-item" to="/streamflow">
        Streamflow
      </router-link>
    </nav>
    <div class="header">
      <h1 class="title">Riverflow</h1>
      <p class="tagline">Texas Edition</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'navbar'
}
</script>

<style lang="css">

</style>
