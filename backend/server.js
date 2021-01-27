const express = require('express')
const app = express()

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://puckersRevenge:zero00zero@puckersrevenge.oczzm.mongodb.net/test', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("wowyay");
});

const Kitten = mongoose.model('Kitten', require('./Schemas/kittenSchema'));

app.get('/', function (req, res) {
  res.send('yay')
})
 app.get('/create/:name', (req, res) => {
  const cat = new Kitten({ name: req.params.name });
  cat.save()
  res.send(cat.speak())
 })
 app.get('/get', async (req, res) => {
  Kitten.find(function (err, kittens) {
    if (err) return console.error(err);
    res.json(kittens);
  })
 })
app.listen(3748)