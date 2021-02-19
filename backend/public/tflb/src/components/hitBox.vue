<template>
  <div>
    <input type="text" placeholder="type">
    <br>
    <input type="number" placeholder="mass">
    <p>Shapes <button v-on:click="addShape">Add</button></p> 
    <Shape v-for="(shape, index) in hitBox.shapes" v-bind:key="index" :shape="shape"/>
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
        console.log(this)
        this.addShape()
    }
}
</script>

<style>

</style>