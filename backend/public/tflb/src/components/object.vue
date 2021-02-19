<template>
<div>
  <h1>Object Stuff</h1>
    <HitBox :hitBox="t"/>
  </div>
</template>

<script>
import HitBox from './hitBox'

export default {
    name: 'Object',
    components: {
        HitBox
    },
    data() {
        return {
            t: {
                shapes: []
            }
        }
    }
}
</script>

<style>

</style>