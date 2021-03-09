const mongoose = require('mongoose')

const LevelSchema = new mongoose.Schema({
    name: String,
    objects: [
        {
            name: String,
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
            },
            attributes: [{
                name: String,
                value: String
            }]
        }
    ]
})
module.exports = LevelSchema
/**
 * 
                x: mongoose.Decimal128,
                y: mongoose.Decimal128,
                z: mongoose.Decimal128
            
 */