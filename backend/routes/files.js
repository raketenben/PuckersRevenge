const express = require('express')
const router = express.Router()

const { readdirSync, mkdirSync, existsSync, writeFile } = require('fs')

router.get('/', async (req, res) => {
  const dirList = await readdirSync('/var/www/puckersrevenge/resources', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  
  const fileList = {}
  await dirList.forEach( async (el) => {
    fileList[el] = await readdirSync(`/var/www/puckersrevenge/resources/${el}`, { withFileTypes: true }).map(dirent => dirent.name)
  })
  res.json(fileList)
})

router.post('/createFolder/:name', async (req, res) => {
  if(!existsSync(`/var/www/puckersrevenge/resources/${req.params.name}`)){
    await mkdirSync(`/var/www/puckersrevenge/resources/${req.params.name}`)
    res.json({msg: 'File has been created'})
  } else {
    res.json({error: 'File already exist'})
  }
})

router.post('/uploadFiles/:name', async (req, res) => {
  req.body.files.forEach( el => {
    if(!existsSync(`/var/www/puckersrevenge/resources/${req.params.name}/${el.name}`))
      writeFile(`/var/www/puckersrevenge/resources/${req.params.name}/${el.name}`, el.data, 'binary', function(err){
        if(err) console.error(err)
        if(err) res.json({error: 'Error with a file'})
      })
  })
  res.json({msg: 'File is now on the INTERNET'})
  /*
  if(!existsSync(`/var/www/puckersrevenge/resources/${req.params.name}`)){
    await mkdirSync(`/var/www/puckersrevenge/resources/${req.params.name}`)
    res.json({msg: 'File has been created'})
  } else {
    res.json({error: 'File already exist'})
  }
  */
})

module.exports = router