const express = require('express')
const router = express.Router()

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://puckersRevenge:zero00zero@puckersrevenge.oczzm.mongodb.net/GameDev', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("wowyay");
});

const Level = mongoose.model('Level', require('../Schemas/Level'));

router.get('/', async (req, res) => {
    Level.find(function (err, level) {
      if(err) return console.error(err)
        res.json(level)
    })
  })

  router.post('/', async (req, res) => {
    const lev = new Level(req.body.payload);
    lev.save()
  })
module.export = router