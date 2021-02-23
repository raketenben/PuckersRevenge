<template>
  <div>
    <input type="text" placeholder="type">
    <br>
    <input type="number" placeholder="mass">
    <p>Shapes <button @click="addShape">Add</button></p> 
    <Shape v-for="(shape, index) in hitBox.shapes" :ref="'hitbox-'+index" v-bind:key="index" :shape="shape"/>
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
        !(this.$props.hitBox.shapes.length > 0) &&
        this.addShape()
    }
}
</script>

<style>

</style>