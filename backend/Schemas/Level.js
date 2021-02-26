const mongoose = require('mongoose')

const LevelSchema = new mongoose.Schema({
    name: String,
    objects: [
        {
            name: String,
            position: {},
            rotation: {},
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