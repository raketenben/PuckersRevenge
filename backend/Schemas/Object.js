const mongoose = require('mongoose')

const ObjectSchema = new mongoose.Schema({
    name: String,
    environment: Buffer,
    model: Buffer,
    hitBoxes: [{
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
    }]
})
module.exports = ObjectSchema