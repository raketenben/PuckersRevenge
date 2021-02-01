const express = require('express')
const app = express()
const port = 3748

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://puckersRevenge:zero00zero@puckersrevenge.oczzm.mongodb.net/GameDev', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("wowyay");
});

const Level = mongoose.model('Level', require('./Schemas/Level'));
const Object = mongoose.model('Object', require('./Schemas/Objects'));

app.get('/api/level', async (req, res) => {
  Level.find(function (err, level) {
    if(err) return console.error(err)
      res.json(level)
  })
})
app.post('/api/level', async (req, res) => {
  const lev = new Level(req.params.payload);
  lev.save()
})

app.get('/api/objects', async (req, res) => {
  Object.find(function (err, obj) {
    if(err) return console.error(err)
      res.json(obj)
  })
})
app.post('/api/objects', async (req, res) => {
  const obj = new Object(req.params.payload);
  obj.save()
})

app.get('/', (req, res) => {
  res.send('Hello World3!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
