const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

const url = process.env.MONGO_URI
const dev = 'https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens'

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))

// get objkts by tag

const getTag = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('metadata')
  let r = await objkts.find({ tags : { $all : [ req.body.tag ]}})
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
  let r = await objkts.find({ token_id : req.body.token_id })
  res.json({
      result : await r.toArray()
  })
}

// get objkts by ids

// todo

app.post('/tag', async (req, res) => {
  await getTag(req, res)
})

app.post('/objkt', async (req, res) => {
  await getObjkt(req, res)
})

//app.listen(3001)
module.exports.database = serverless(app)
