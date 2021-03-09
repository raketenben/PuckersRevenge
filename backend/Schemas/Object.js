const defaultHitBox = [{
    type: '',
    mass: Number,
    shapes:[{
        shape: '',
        size: {
            x: Number,
            y: Number,
            z: Number
        },
        position: {
            x: Number,
            y: Number,
            z: Number
        },
        rotation: {
            x: Number,
            y: Number,
            z: Number,
            w: Number
        }
    }]
}]
const mongoose = require('mongoose')

const ObjectSchema = new mongoose.Schema({
    name: String,
    hitBoxes: {
        type: Array,
        default: defaultHitBox
    }
})
module.exports = ObjectSchema
/**
 * {
        type: String,
        mass:mongoose.Decimal128,
        shapes:[{
            shape: String,
            size: {
                x: mongoose.Decimal128,
                y: mongoose.Decimal128,
                z: mongoose.Decimal128
            },
            position: {
                x: mongoose.Decimal128,
                y: mongoose.Decimal128,
                z: mongoose.Decimal128
            },
            rotation: {
                x: mongoose.Decimal128,
                y: mongoose.Decimal128,
                z: mongoose.Decimal128,
                w: mongoose.Decimal128
            }
        }]
    }
 */