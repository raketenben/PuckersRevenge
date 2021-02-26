const express = require('express')
const router = express.Router()

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://puckersRevenge:zero00zero@puckersrevenge.oczzm.mongodb.net/GameDev', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("wowyay");
});

const Level = mongoose.model('Level', require('../Schemas/Level'));

router.get('/', async (req, res) => {
    Level.find({}, 'name', function (err, lev) {
      if(err) return console.error(err)
        res.json(lev)
    })
  })
  router.get('/:name', async (req, res) => {
    Level.find({name: req.params.name},function (err, lev) {
      if(err) return console.error(err)
        res.json(lev[0])
    })
  })
  router.delete('/:name', async (req, res) => {
    Level.deleteOne({name: req.params.name},function (err) {
      if(err) {
        console.error(err)
        res.json({error:'error'})
      } else res.json({msg:'Ok'})
    })
  })

router.post('/', async (req, res) => {
  let umique = false;

  await Level.find({name: req.body.payload.name},function (err, lev) {
    if(err) return console.error(err)
    unique = !lev.length
  })
  if(!unique) return res.json({error: 'Level with name alredy exist'})

  const lev = new Level(req.body.payload);
  lev.save().then(() => res.json({msg: "Ok"})).catch((e) => res.json({error: e}))   
})

router.patch('/', async (req, res) => {
  Level.updateOne({_id: req.body.payload._id}, req.body.payload, function (err) {
    if(err) {
      console.error(err)
      res.json({error:'error'})
    } else res.json({msg:'Ok'})
  })   
})

module.exports = router
/*const express = require('express')
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
module.export = router*/