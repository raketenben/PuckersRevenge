<template>
  <ul>
      <li v-for="(element, index) in elements" :key="index"><ListElement :name="element.name"/></li>
  </ul>
</template>

<script>
import ListElement from './ListElement.vue'
export default {
    name: 'List',
    props: {
        path: String
    },
    components: {
        ListElement
    },
    async created() {
        const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/objects`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      this.elements = data
    },
    data() {
        return {
            elements: [{}]
        }
    }
}
</script>

<style>

</style>