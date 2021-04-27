const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

const url = process.env.MONGO_URI

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
  let r = await objkts.find({ tags : { $all : [ req.query.tag ]}})
  res.json({
      result : await r.toArray()
  })
}

// get objkt by id

const getObjkt = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('metadata')
  let r = await objkts.find({ token_id : parseInt(req.query.token_id) })

  res.json({
      result : await r.toArray()
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

app.get('/tag', async (req, res) => {
  await getTag(req, res)
})

app.get('/objkt', async (req, res) => {
  await getObjkt(req, res)
})

app.post('/objkts', async (req, res) => {
  await getObjkts(req, res)
})

//app.listen(3002)
module.exports.database = serverless(app)
