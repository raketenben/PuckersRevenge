<template>
  <div id="app">
    <h1>Editor</h1>
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
  box-sizing:border-box;
  padding: 0;
  margin: 0;
}

html,body {
  width:100%;
  height:100%;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: rgb(44,110,44);
  background: radial-gradient(circle, rgba(44,110,44,1) 0%, rgba(27,27,27,1) 100%);
  font-size: 1.05em;
}

#app {
  color: white;
  background: #242424;
  border-radius: 25px;
  margin: auto;
  width: 70%;
  padding: 20px;
  min-height: 100vh;
}

p {
  margin: 5px;;
}

h1, hr {
  margin: 10px;
}

input {
  margin: 2px;
  padding: 4px 8px;
  border: solid 2px rgb(24 118 0);
  border-radius: 50px;
}

label {
  margin: 5px;
}

button {
  margin: 2px;
  padding: 4px 8px;
  border: solid 2px rgb(24 118 0);
  border-radius: 50px;
  font-size: 1.1em;
}

button {
  padding: 5px 10px;
  border: solid 2px rgb(2, 70, 0);
  background: rgb(88, 146, 0);
  color: white;
}

select {
  margin: 2px;
  padding: 4px 8px;
  border: solid 2px rgb(24 118 0);
  border-radius: 50px;
}
</style>