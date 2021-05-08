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
  const objkts = database.collection('OBJKT')
  const query = {"tags": { "$all": [ req.query.tag ]}, 
          "$expr": {"$ne": [{"$size": {"$setDifference": 
            ["$owners_count.count_editions","$owners_count.count_burned"]}},0]}
        }
  const limit = parseInt(req.query.size) || 25
  const offset = parseInt(req.query.page) * limit || 0
  let r = await objkts.find(query).limit(limit).skip(offset)
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
  const limit = parseInt(req.query.size) || 25
  const offset = parseInt(req.query.page) * limit || 0
  try {
    let r = await objkts.aggregate([
      { $project: { tags: 1, count: { $add: 1 } } },
      { $unwind: '$tags'},
      { $group: { _id: { tag: '$tags', lower: { $toLower : '$tags' } }, count: { $sum: '$count' } } },
      { $sort: { "count": -1 } }
    ]).skip(offset).limit(limit)
    res.json({
        result : await r.toArray()
    })
  } catch(e) {
    res.status(500).json(e)
  }
}

// get token owners by owner_id and/or token_id
const getTokenOwners = async (req, res) => {
  try {
    const objkt = parseInt(req.query.objkt_id)
    //TODO: more validation
    if (!objkt || objkt < 0 || (typeof objkt !=='number')) {
      throw(400)
    }
    const client = new MongoClient(url)
    await client.connect()
    const database = client.db('OBJKTs-DB')
    const owners = database.collection('owners')
    const query = { "token_id": objkt , "balance": {"$ne": 0}}
    let r = await owners.find(query).toArray()
    var obj = Object.assign({}, ...(r.map(item => ({ [item.owner_id]: item.balance }) )))
    res.json(obj)
  } catch(e) {
    switch (e) {
      case 400:
        res.status(400).json({"message":"bad request"})
      default:
        res.status(500).json(e)
    }
  }
}

// get objkt by id

const getObjkt = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('OBJKT')
  let r = await objkts.find({ token_id : parseInt(req.query.token_id) })

  res.json({
      result : (await r.toArray())[0]
  })
}

// get objkts by ids

const getObjkts = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('OBJKT')
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


const getOBJKTDataByCreator = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('OBJKT')
  const query = { "creators.0": { "$in": [req.query.tz] }}
  const limit = parseInt(req.query.size) || 25
  const offset = parseInt(req.query.page) * limit || 0
  let r = await objkts.find(query).limit(limit).skip(offset)
  res.json({
    result : await r.toArray()
  })
}

const getOBJKTDataByOwner = async (req, res) => {
  const client = new MongoClient(url)

  await client.connect()
  const database = client.db('OBJKTs-DB')
  const objkts = database.collection('OBJKT')
  const query = { "owners.owner_id": { "$in": [req.query.tz] }}
  const limit = parseInt(req.query.size) || 25
  const offset = parseInt(req.query.page) * limit || 0
  let r = await objkts.find(query).limit(limit).skip(offset)
  res.json({
    result : await r.toArray()
  })
}

app.get('/tz_creator', async (req, res) => {
  await getOBJKTDataByCreator(req, res)
})

app.get('/tz_owner', async (req, res) => {
  await getOBJKTDataByOwner(req, res)
})

app.get('/tag', async (req, res) => {
  await getTag(req, res)
})

app.get('/unique_tags', async (req, res) => {
  await getUniqueTags(req, res)
})

app.get('/owners', async (req, res) => {
  await getTokenOwners(req, res)
})

app.get('/objkt', async (req, res) => {
  await getObjkt(req, res)
})

app.post('/objkts', async (req, res) => {
  await getObjkts(req, res)
})

app.post('/subjkt', async (req, res) => {
  await getSubjkt(req, res)
})

//app.listen(3002)
module.exports.database = serverless(app)
