<template>
<div>
  <h1>Object Stuff</h1>
    <p>Name</p> 
    <input type="text" v-model="object.name">
    <p>Enviroment</p> 
    <input type="file" @change="setEnviroment">
    <p>Model</p>
    <input type="file" @change="setModel">
    
    <p>HitBoxes <button @click="addHitBox">Add</button></p>
    <div v-for="(hitBox, index) in object.hitboxes" v-bind:key="index">
        <HitBox :hitBox="hitBox" />
        <button @click="deleteElement(index)">Delete</button>
    </div>
  </div>
</template>

<script>
import HitBox from './hitBox'

export default {
    name: 'Object',
    components: {
        HitBox
    },
    methods: {
        deleteElement: function(key) {
            this.object.hitboxes.splice(key,1)
        },
        addHitBox: function () {
            this.object.hitboxes.push({
                type: "",
                mass: 0,
                shapes: []
            })
        },
        setEnviroment: function (event) {
            let file = event.target.files[0]
            let reader = new FileReader()
            reader.addEventListener('load', (data) => {
                this.object.environment = data.target.result

            })
            reader.readAsBinaryString(file)
        },
        setModel: function (event) {
            let file = event.target.files[0]
            let reader = new FileReader()
            reader.addEventListener('load', (data) => {
                this.object.model = data.target.result

            })
            reader.readAsBinaryString(file)
        }
    },
    created() {
        this.addHitBox()
    },
    data() {
        return {
            object: {
                name: "",
                environment: null,
                model: null,
                hitboxes: []
            }
        }
    }
}
</script>

<style>

</style>