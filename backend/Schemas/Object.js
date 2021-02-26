const defaultHitBox = [{
    type: '',
    mass: 0.00,
    shapes:[{
        shape: '',
        size: {
            x: 0.00,
            y: 0.00,
            z: 0.00
        },
        position: {
            x: 0.00,
            y: 0.00,
            z: 0.00
        },
        rotation: {
            x: 0.00,
            y: 0.00,
            z: 0.00,
            w: 0.00
        }
    }]
}]
const mongoose = require('mongoose')

const ObjectSchema = new mongoose.Schema({
    name: String,
    environment: String,
    model: String,
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