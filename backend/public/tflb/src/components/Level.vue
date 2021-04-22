<template>
  <div>
    <h1>Level Stuff</h1>
    <p>Name</p> 
    <input type="text" v-model="level.name">

    <p>Entry Point</p>
    <Transform :values="level.levelEntry"/>

    <p>Objects <button @click="addLevelObject">Add</button></p>
    <div v-for="(LevelObject, index) in level.objects" :key="index">
      <LevelObject :LevelObject="LevelObject"/>
      <button @click="deleteElement(index)">Delete</button>
    </div>
  </div>
</template>

<script>
import LevelObject from './LevelObjct'
import Transform from './Transform'

export default {
    name: 'Level',
    props: {
      editElemet: {}
    },
    components: {
      Transform,
      LevelObject
    },
    methods: {
      addLevelObject: function() {
        this.level.objects.unshift({
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

      if(this.level.levelEntry == undefined)
        this.level.levelEntry = {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          w: 0.0
        }
    },
    data() {
      return {
        level: {
          name: '',
          levelEntry: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          objects: []
        }
      }
    }
}
</script>

<style>

</style>