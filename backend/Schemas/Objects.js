const mongoose = require('mongoose')

const ObjectSchema = new mongoose.Schema({
    modle: Buffer,
    hitBoxes: [{
        shape: Number,
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
        },
    }]
})
module.exports = ObjectSchema