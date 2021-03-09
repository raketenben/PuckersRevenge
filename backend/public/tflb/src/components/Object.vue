<template>
<div>
  <h1>Object Stuff</h1>
    <p>Name</p> 
    <input type="text" v-model="object.name">

    <p>HitBoxes <button @click="addHitBox">Add</button></p>
    <div v-for="(hitBox, index) in object.hitBoxes" v-bind:key="index" class="div-list">
        <HitBox :hitBox="hitBox" />
        <button @click="deleteElement(index)">Delete</button>
    </div>
  </div>
</template>

<script>
import HitBox from './HitBox'

export default {
    name: 'Object',
    components: {
        HitBox
    },
    props: {
        editElemet: {}
    },
    methods: {
        deleteElement: function(key) {
            this.object.hitBoxes.splice(key,1)
        },
        addHitBox: function () {
            this.object.hitBoxes.unshift({
                type: 'static',
                mass: 0,
                shapes: []
            })
        }
    },
    created() {
        if(this.editElemet)
            this.object = this.editElemet
        else
            this.addHitBox()
    },
    data() {
        return {
            object: {
                name: "",
                hitBoxes: []
            }
        }
    }
}
</script>

<style>

</style>