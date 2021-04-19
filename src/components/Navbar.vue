<template>
  <div class="container">
    <div id="bezierButton" class="button" @click="$router.push('/bezier').catch(() => {})">Bezier</div>
    <div id="quaternionButton" class="button" @click="$router.push('/quaternion').catch(() => {})">
      Quaternionen
    </div>
    <div id="clothButton" class="button" @click="$router.push('/particle').catch(() => {})">
      Cloth
    </div>
    <div v-if="$route.path === '/bezier'" id="kontrollPunkt">Click to add a new control point</div>
  </div>
</template>

<script></script>

<style scoped>
.container {
  height: 100;
  display: flex;
  justify-content: space-around;
  width: 65%;
  margin-top: 10px;
}

.button {
  box-shadow: inset 0px 0px 0px 0px transparent;
  height: 60px;
  width: 100%;
  text-transform: uppercase;
  /* margin: 0 10px 0px 10px; */
  color: white;
  display: flex;
  font-weight: 700;
  font-size: 1.2em;
  justify-content: center;
  align-items: center;
  clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
  cursor: pointer;
  background: linear-gradient(to right, #141e30 0%, #243b55 100%);
  letter-spacing: 0.4em;
  transition: all 0.3s ease-in-out;
}

#kontrollPunkt {
  position: absolute;
  top: 130%;
  font-size: 1.4em;
}

.button:hover {
  box-shadow: inset 0px 0px 0px 4px white;
}
</style>
