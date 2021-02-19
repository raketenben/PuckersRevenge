<template>
  <div>
    <p>Shape</p>
    <select v-model="shape.shape">
      <option value="static">static</option>
      <option value="dynamic">dynamic</option>
      <option value="kinematic">kinematic</option>
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
import Transform from './transform'
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