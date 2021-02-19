<template>
  <div id="app">
    <h1>Tool for lazy Ben's</h1>
    <label for="path">Select Path </label>

    <select id="Path" v-model="path">
      <option value="object">Object</option>
      <option value="level">Level</option>
    </select>
<hr>
    <Object v-if="path == 'object'"/>
    <Level v-if="path == 'level'"/>
  </div>
</template>

<script>
import Level from './components/level.vue'
import Object from  './components/object.vue'

export default {
  name: 'App',
  components: {
    Level,
    Object
  },
  data() {
    return {
      path: 'object'
    }
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
body {
  background: repeating-linear-gradient(
    45deg,
    #252525 25%,
    #252525 70%,
    #00d200 30%,
    #00d200 75%
  );
  background-size: 100px 100px;
}
#app {
  color: azure;
  background: #363636;
  margin: 1em auto;
  width: 90%;
  padding: .5em;
  height: 90vh;
}
h1, hr {
  margin: .5em 0;
}
</style>