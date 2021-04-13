<template>
  <div id="app">
    <h1>Editor</h1>
    <label for="path">Select Path </label>

    <select id="Path" v-model="path">
      <option value="object">Object</option>
      <option value="level">Level</option>
      <option value="files">Files</option>
    </select>

    <fieldset>
      <input type="radio" v-model="list" id="list-no" :value="false">
      <label for="list-no">Create</label>
      <input type="radio" v-model="list" id="list-yes" :value="true">
      <label for="list-yes">Manage existing</label>
    </fieldset>
    <hr>

    <div v-if="list">
      <List :path="path" />
    </div>
    <div v-else-if="path == 'files'">
      <Files />
    </div>
    <div v-else>
      <Object v-if="path == 'object'" ref="formulars" :editElemet="editElemet"/>
      <Level v-if="path == 'level'" ref="formulars" :editElemet="editElemet"/>
      <input type="submit" @click="submit" value="Create"/>
    </div>

    <div v-text="msg"></div>
    <div v-text="error" class="errorBox"></div>
  </div>
</template>

<script>
import Level from './components/Level.vue'
import Object from  './components/Object.vue'
import List from './components/List.vue'
import Files from './components/Files.vue'

export default {
  name: 'App',
  components: {
    Level,
    Object,
    List,
    Files
  },
  methods: {
    setElement: function(element) {
      this.editElemet = element
      this.list = false
    },
    submit: async function() {
      //console.log(JSON.parse(JSON.stringify(this.$refs["formulars"][this.path])))
      let data = {}
      try {
      const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/${this.path}/`, {
        method: (this.editElemet ? 'PATCH':'POST'),
        headers: {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payload: JSON.parse(JSON.stringify(this.$refs["formulars"][this.path]))
        })
      })
      data = await response.json()
      }
      catch(e){
        this.msg = 'Fetch error'
      }finally {
        this.error = data?.error
        this.msg = data?.msg
      }
    }
  },
  data() {
    return {
      path: 'object',
      list: false,
      editElemet: null,
      editMode: false,
      error: '',
      msg: ''
    }
  }
}
</script>

<style>
/** Mittelmäßiges CSS von diesem Bäääahän*/
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
.errorBox {
  color: red
}
.div-list {
  margin-left: .8em;
  margin-bottom: 1.5em;
}
</style>