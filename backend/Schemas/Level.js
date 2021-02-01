const mongoose = require('mongoose')

const LevelSchema = new mongoose.Schema({
    name: String,
    objects: [
        {
            modle: mongoose.ObjectId,
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
            attributes: [{
                name: String,
                value: String
            }]
        }
    ]
})
module.exports = LevelSchema