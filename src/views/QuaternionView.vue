<template>
  <div class="container">
    <canvas id="quaternionenCanvas"></canvas>
  </div>
</template>

<script>
import QuaternionScene from '../scripts/scenes/QuaternionScene'

let scene
export default {
  async mounted() {
    const canvas = document.getElementById('quaternionenCanvas')
    scene = new QuaternionScene(window.innerWidth, window.innerHeight, canvas)
    scene.animate()
  },
  destroyed() {
    let controlls = document.querySelectorAll('.dg.main.a')
    if (controlls !== undefined) controlls[0].remove()
    scene.stopAnimation()
  }
}
</script>

<style scoped>
#quaternionenCanvas {
  display: block;
  width: 100%;
  height: 100%;
}
.container {
  position: relative;
  height: 100%;
}
</style>
