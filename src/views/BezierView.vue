<template>
  <div class="container">
    <canvas id="bezierCanvas"></canvas>
  </div>
</template>

<script>
import BezierScene from '../scripts/scenes/BezierScene.js'
let scene
export default {
  mounted() {
    const canvas = document.getElementById('bezierCanvas')
    scene = new BezierScene(window.innerWidth, window.innerHeight, canvas)
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
#bezierCanvas {
  display: block;
  width: 100%;
  height: 100%;
}
.container {
  position: relative;
  /* background: fuchsia; */
  height: 100%;
}
</style>
