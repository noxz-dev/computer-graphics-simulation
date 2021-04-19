<template>
  <div class="container">
    <canvas id="clothCanvas"></canvas>
  </div>
</template>

<script>
import ParticleScene from '../scripts/scenes/ParticleScene'

let scene
export default {
  mounted() {
    const canvas = document.getElementById('clothCanvas')
    scene = new ParticleScene(window.innerWidth, window.innerHeight, canvas)
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
#clothCanvas {
  display: block;
  width: 100%;
  height: 100%;
}
.container {
  position: relative;
  height: 100%;
}
</style>
