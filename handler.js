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
  let r = await objkts
    .find({ tags : { $all : [ req.query.tag ] } })
    .collation({locale: 'en', strength: 1})
  res.json({
      result : await r.toArray()
  })
}

// get unique tags

const getUniqueTags = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('metadata')
  try {
    let r = await objkts.aggregate([
      { $project: { tags: 1, count: { $add: 1 } } },
      { $unwind: '$tags'},
      { $group: { _id: { tag: '$tags', lower: { $toLower : '$tags' } }, count: { $sum: '$count' } } },
      { $sort: { "count": -1 } }
    ])
    res.json({
        result : await r.toArray()
    })
  } catch(e) {
    res.status(500).json(e)
  }
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

app.get('/unique_tags', async (req, res) => {
  await getUniqueTags(req, res)
})

app.get('/objkt', async (req, res) => {
  await getObjkt(req, res)
})

app.post('/objkts', async (req, res) => {
  await getObjkts(req, res)
})

//app.listen(3002)
module.exports.database = serverless(app)
