<template>
  <div>
    <p>Name</p> 
    <input type="text" v-model="LevelObject.name">
    <p>Size</p>
    <Transform :values="LevelObject.size"/>
    <p>Position</p>
    <Transform :values="LevelObject.position"/>
    <p>Rotation</p>
    <Transform :values="LevelObject.rotation" rotation/>
  </div>
</template>

<script>
import Transform from './Transform'
export default {
    name: 'LevelObject',
    components: {
        Transform
    },
    props: {
        LevelObject: {}
    }
}
</script>

<style>

</style>