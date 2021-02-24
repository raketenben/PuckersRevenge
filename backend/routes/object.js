const express = require('express')
const router = express.Router()

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://puckersRevenge:zero00zero@puckersrevenge.oczzm.mongodb.net/GameDev', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("wowyay");
});

const Object = mongoose.model('Object', require('../Schemas/Objects'));

router.get('/', async (req, res) => {
    Object.find(function (err, obj) {
      if(err) return console.error(err)
        res.json(obj)
    })
  })

router.post('/', async (req, res) => {
    const obj = new Object(req.body.payload);
    obj.save().then(() => res.json({msg: "Ok"})).catch((e) => res.json({error: e}))  
  })

module.exports = router