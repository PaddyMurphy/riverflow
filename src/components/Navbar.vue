<template>
  <div>
    <!-- TODO: set to dev mode while testing -->
    <nav class="nav" v-if="isDev">
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
  name: 'navbar',
  computed: {
    isDev: function () {
      if (typeof (process.env.NODE_ENV) === 'string') {
        return (process.env.NODE_ENV === 'development') ? 1 : 0;
      } else {
        return 0;
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

.header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

:root .title, .tagline {
  margin: 1em $default-padding;
}

.title {
  font-size: 1.2em;
}

.tagline {
  font-size: 1em;
}
</style>
