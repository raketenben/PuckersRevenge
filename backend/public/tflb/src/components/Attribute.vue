<template>
  <div>
      <input type="text" v-model="attribute.name" placeholder="name">
      <input type="text" v-model="attribute.value" placeholder="value">
  </div>
</template>

<script>
export default {
    name: 'Attribute',
    props: {
      attribute: {}
    }
}
</script>

<style>

</style>