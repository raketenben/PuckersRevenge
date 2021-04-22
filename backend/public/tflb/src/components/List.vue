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
    methods: {
    getElements: async function(){
        this.error = ''
        this.msg = ''
         const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/${this.path}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        this.elements = data
    },
    editElement: async function(name) {
        this.error = ''
        this.msg = ''
      const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/${this.path}/${name}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        this.$parent.error = data?.error
        this.$parent.msg = data?.msg

        this.$parent.setElement(data)
    },
    deleteElement: async function(name) {
        this.error = ''
        this.msg = ''
        const response = await fetch(`https://puckersrevenge.if-loop.mywire.org/api/${this.path}/${name}`, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        this.$parent.error = data?.error
        this.$parent.msg = data?.msg

        this.getElements()
    }
    },
    async created() {
       await this.getElements()
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