<template>
  <div>
    <navbar class="navBar" />
    <div class="routerContainer">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from './Navbar.vue'
export default {
  components: { Navbar }
}
</script>

<style>
.navBar {
  position: fixed;
  z-index: 999;
  left: 50%;
  transform: translateX(-50%);
}
.routerContainer {
  position: relative;
  width: 100%;
  height: 100vh;
}
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
