<template>
  <div id="app">
    <component-view />
  </div>
</template>

<script>
import ComponentView from './components/ComponentView.vue'
export default {
  components: { ComponentView },
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins';
}

body {
  background: #1d1d21;
}
#app {
  color: #eeeeee;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
