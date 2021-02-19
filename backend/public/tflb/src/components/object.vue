<template>
<div>
  <h1>Object Stuff</h1>
  <Transform :position="t"/>
  <Transform :position="t2" rotation="true" />
  <p> {{ t }}</p>
  <p> {{ t2 }}</p>
  </div>
</template>

<script>
import Transform from './transform'
export default {
    name: 'Object',
    components: {
        Transform
    },
    data() {
        return {
            t: {},
            t2: {}
        }
    }
}
</script>

<style>

</style>