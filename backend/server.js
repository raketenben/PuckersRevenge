const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const port = 3748

app.use(bodyParser.json())
app.use(cors())

app.get('/toolbox', async (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
})

const ObjectRoute = require('./routes/object')
app.use('/api/objects/', ObjectRoute)

const LevelRoute = require('./routes/object')
app.use('/api/level/', LevelRoute)

app.get('/', (req, res) => {
  res.send('This is a api you should not visit this page. <br><b>Go away!!!<b>')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
