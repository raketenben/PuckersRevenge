<template>
  <div>
    <p>Name</p> 
    <input type="text" v-model="LevelObject.name">
    <p>Position</p>
    <Transform :values="LevelObject.position"/>
    <p>Rotation</p>
    <Transform :values="LevelObject.rotation" rotation/>
    <p>Attributes <button @click="addAttribute">Add</button></p>
    <ul>
      <li v-for="(attribute, index) in LevelObject.attributes" :key="index">
        <Attribute :attribute="attribute"/>
        <button @click="deleteAttribute(index)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import Transform from './Transform'
import Attribute from './Attribute'
export default {
    name: 'LevelObject',
    components: {
        Transform,
        Attribute
    },
    props: {
        LevelObject: {}
    },
    methods: {
      addAttribute: function() {
        this.LevelObject.attributes.unshift({
          name: '',
          value: ''
        })
      },
      deleteAttribute: function(key) {
        this.LevelObject.attributes.splice(key,1)
      }
    },
    created() {
       (this.LevelObject.attributes.length < 1)&&
        this.addAttribute()

        if(this.LevelObject.rotation == undefined)
        this.LevelObject.rotation = {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          w: 0.0
        }
    }
}
</script>

<style>

</style>