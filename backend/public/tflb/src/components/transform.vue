<template>
  <div>
      <input type="number" name="x" v-model="position.x" placeholder="x">
      <input type="number" name="y" v-model="position.y" placeholder="y">
      <input type="number" name="z" v-model="position.z" placeholder="z">
      <input v-if="rotation" type="number" name="w" v-model="position.w" placeholder="w">
  </div>
</template>

<script>
export default {
    name: 'Transform',
    props: {
        rotation: {
            type: Boolean,
            default: false
        },
        position: {
            x: Number,
            y: Number,
            z: Number,
            w: Number
        }
    }
}
</script>