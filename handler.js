const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

const url = 'mongodb+srv://crzy:Az102030..@cluster0.nmdg5.mongodb.net/OBJKTs-DB?retryWrites=true&w=majority'

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))

// burned objkts
// tz1burnburnburnburnburnburnburjAYjjX

// get objkts by tag

const getTag = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('metadata')
  //let r = await objkts.find({ tags : { $all : [ req.query.tag ]}})\
  let r = await objkts.find({ tags : { $all : [ req.query.tag ]}})
  console.log(await r.toArray())

  res.json({
      result : (await r.toArray()).slice( parseInt(req.query.page) * 25, parseInt(req.query.page) * 25 + 25)
  })
}

// get objkt by id

const getObjkt = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('metadata')
  let r = await objkts.find({ token_id : parseInt(req.body.token_id) })
  console.log((await r.toArray())[0])
  res.json({
      result : (await r.toArray())[0]
  })
}

// get objkts by ids

const getObjkts = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('metadata')
  let r = await objkts.find({ token_id : { $in : req.body.arr }})
  res.json({
    result : await r.toArray()
  })
}

// get subjkt

const getSubjkt = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const subjkts = database.collection('subjkt')
  let r = await subjkts.find({ subjkt : req.body.subjkt })
  res.json({
    result : await r.toArray()
  })
}

app.get('/tag', async (req, res) => {
  await getTag(req, res)
})

app.post('/objkt', async (req, res) => {
  await getObjkt(req, res)
})

app.post('/objkts', async (req, res) => {
  await getObjkts(req, res)
})

app.post('/subjkt', async (req, res) => {
  await getSubjkt(req, res)
})

app.listen(3002)
//module.exports.database = serverless(app)
