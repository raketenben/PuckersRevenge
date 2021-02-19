<template>
  <div>
      <input type="number" name="x" v-model="values.x" placeholder="x">
      <input type="number" name="y" v-model="values.y" placeholder="y">
      <input type="number" name="z" v-model="values.z" placeholder="z">
      <input v-if="rotation" type="number" name="w" v-model="values.w" placeholder="w">
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
        values: {
            x: Number,
            y: Number,
            z: Number,
            w: Number
        }
    }
}
</script>