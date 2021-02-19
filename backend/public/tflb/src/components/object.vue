<template>
<div>
  <h1>Object Stuff</h1>
    <p>Enviroment</p> 
    <input type="file" @change="setEnviroment">
    <p>Model</p>
    <input type="file" @change="setModel">
    
    <p>HitBoxes <button @click="addHitBox">Add</button></p>
    <HitBox v-for="(hitBox, index) in object.hitboxes" :hitBox="hitBox" v-bind:key="index"/>
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
        addHitBox: function () {
            this.object.hitboxes.push({
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
    data() {
        return {
            object: {
                environment: null,
                model: null,
                hitboxes: [{
                    shapes: []
            }]
            }
        }
    }
}
</script>

<style>

</style>