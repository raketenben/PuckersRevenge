<template>
  <div>
    <input type="text" v-model="hitBox.type" placeholder="type">
    <br>
    <input type="number" v-model="hitBox.mass" placeholder="mass">
    <p>Shapes <button @click="addShape">Add</button></p> 
    <div v-for="(shape, index) in hitBox.shapes" v-bind:key="index">
        <Shape :shape="shape"/>
        <button @click="deleteElement(index)">Delete</button>
    </div>
  </div>
</template>

<script>
import Shape from './shape'

export default {
    name: 'HitBox',
    components: {
        Shape
    },
    methods: {
        deleteElement: function(key) {
            this.$props.hitBox.shapes.splice(key,1)
        },
        addShape: function () {
            this.$props.hitBox.shapes.push({
                    shape: 'static',
                    size: {},
                    position: {},
                    rotation: {}
                })
        }
    },
    props: {
        hitBox: {}
    },
    created: function () {
        !(this.$props.hitBox.shapes.length > 0) &&
        this.addShape()
    }
}
</script>

<style>

</style>