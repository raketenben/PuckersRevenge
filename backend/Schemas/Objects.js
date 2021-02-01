const mongoose = require('mongoose')

const ObjectSchema = new mongoose.Schema({
    modle: Buffer,
    hitBoxes: [{
        shape: Number,
        size: {
            X: mongoose.Decimal128,
            Y: mongoose.Decimal128,
            Z: mongoose.Decimal128
        },
        position: {
            X: mongoose.Decimal128,
            Y: mongoose.Decimal128,
            Z: mongoose.Decimal128
        },
        rotation: {
            X: mongoose.Decimal128,
            Y: mongoose.Decimal128,
            Z: mongoose.Decimal128,
            W: mongoose.Decimal128
        },
    }]
})
module.exports = ObjectSchema