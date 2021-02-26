<template>
  <div>
    <p>Shape</p>
    <select v-model="shape.shape">
        <option value="box">box</option>
        <option value="sphere">sphere</option>
        <option value="cylinder">cylinder</option>
    </select>
    <p>Size</p>
    <Transform :values="shape.size"/>
    <p>Position</p>
    <Transform :values="shape.position"/>
    <p>Rotation</p>
    <Transform :values="shape.rotation" rotation/>
  </div>
</template>

<script>
import Transform from './Transform'
export default {
    name: 'Shape',
    components: {
        Transform
    },
    props: {
        shape: {}
    }
}
</script>

<style>

</style>