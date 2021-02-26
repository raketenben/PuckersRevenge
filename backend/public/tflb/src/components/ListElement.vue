<template>
  <div>
      <p v-text="name"></p>
      <button @click="editElement">Edit</button>
      <button @click="deleteElement">Delete</button>
  </div>
</template>

<script>
export default {
    name: 'Listelement',
    props: {
        name: String
    },
    methods: {
        editElement: function() {
            this.$parent.editElement(this.name)
        },
        deleteElement: function() {
            this.$parent.deleteElement(this.name)
        }
    }
}
</script>

<style>

</style>