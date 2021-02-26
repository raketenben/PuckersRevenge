<template>
  <div>
    <h1>Level Stuff</h1>
    <p>Name</p> 
    <input type="text" v-model="level.name">
    <p>Objects <button @click="addLevelObject">Add</button></p>
    <div v-for="(LevelObject, index) in level.objects" :key="index">
      <LevelObject :LevelObject="LevelObject"/>
      <button @click="deleteElement(index)">Delete</button>
    </div>
  </div>
</template>

<script>
import LevelObject from './LevelObjct'

export default {
    name: 'Level',
    props: {
      editElemet: {}
    },
    components: {
      LevelObject
    },
    methods: {
      addLevelObject: function() {
        this.level.objects.push({
          name: '',
          position: {},
          rotation: {},
          attributes: []
        })
      },
      deleteElement: function(key) {
        this.level.objects.splice(key,1)
      }
    },
    created: function() {
      if(this.editElemet)
        this.level = this.editElemet
      else
        this.addLevelObject()
    },
    data() {
      return {
        level: {
          name: '',
          objects: []
        }
      }
    }
}
</script>

<style>

</style>