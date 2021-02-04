const mongoose = require('mongoose')

const LevelSchema = new mongoose.Schema({
    name: String,
    objects: [
        {
            modle: mongoose.ObjectId,
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
            attributes: [{
                name: String,
                value: String
            }]
        }
    ]
})
module.exports = LevelSchema