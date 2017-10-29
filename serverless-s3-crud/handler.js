'use strict'

const Create = require('./handlers/create.js')
const List = require('./handlers/list.js')
const ReadAll = require('./handlers/read-all.js')
const ReadOne = require('./handlers/read-one.js')
const Update = require('./handlers/update.js')
const Delete = require('./handlers/delete.js')

function makeResponse(error, result) {
  const statusCode = error && error.statusCode || 200
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify(result),
  }
}

exports.create = (event, context, callback) => {
  Create(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}

exports.list = (event, context, callback) => {
  List(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}

exports.readAll = (event, context, callback) => {
  ReadAll(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}

exports.readOne = (event, context, callback) => {
  ReadOne(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}

exports.update = (event, context, callback) => {
  Update(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}

exports.delete = (event, context, callback) => {
  Delete(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}
