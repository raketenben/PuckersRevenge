const express = require('express')
const router = express.Router()

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://puckersRevenge:zero00zero@puckersrevenge.oczzm.mongodb.net/GameDev', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("wowyay");
});

const Object = mongoose.model('Object', require('../Schemas/Object'));

router.get('/', async (req, res) => {
    Object.find({}, 'name', function (err, obj) {
      if(err) return console.error(err)
        res.json(obj)
    })
  })
  router.get('/:name', async (req, res) => {
    Object.find({name: req.params.name},function (err, obj) {
      if(err) return console.error(err)
      res.json(obj[0])
    })
  })
  router.delete('/:name', async (req, res) => {
    Object.deleteOne({name: req.params.name},function (err) {
      if(err) {
        console.error(err)
        res.json({error:'error'})
      } else res.json({msg:'Ok'})
    })
  })

router.post('/', async (req, res) => {
  let unique = false;
  console.log(JSON.stringify(req.body.payload,null,4))

  await Object.find({name: req.body.payload.name},function (err, obj) {
    if(err) return console.error(err)
    unique = !obj.length
  })
  if(!unique) return res.json({error: 'Object with name alredy exist'})

  const obj = new Object(req.body.payload);
  obj.save().then(() => res.json({msg: "Ok"})).catch((e) => res.json({error: e}))   
})

router.patch('/', async (req, res) => {
  Object.updateOne({_id: req.body.payload._id}, req.body.payload, function (err) {
    if(err) {
      console.error(err)
      res.json({error:'error'})
    } else res.json({msg:'Ok'})
  })   
})

module.exports = router


      