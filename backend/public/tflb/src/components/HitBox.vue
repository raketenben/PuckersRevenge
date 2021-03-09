<template>
  <div>
    <p>Type</p>
    <select v-model="hitBox.type">
        <option value="static">static</option>
        <option value="dynamic">dynamic</option>
        <option value="kinematic">kinematic</option>
    </select>
    <br>
    <p>Mass</p>
    <input type="number" v-model.number="hitBox.mass" placeholder="mass">
    <p>Shapes <button @click="addShape">Add</button></p> 
    <div v-for="(shape, index) in hitBox.shapes" v-bind:key="index" class="div-list">
        <Shape :shape="shape"/>
        <button @click="deleteElement(index)">Delete</button>
    </div>
  </div>
</template>

<script>
import Shape from './Shape'

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
            this.$props.hitBox.shapes.unshift({
                    shape: 'box',
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