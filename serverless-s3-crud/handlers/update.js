'use strict'

const AWS = require('aws-sdk')
const S3 = new AWS.S3(require('../s3config.js')())

module.exports = (event, callback) => {
  S3.upload({
    Bucket: 'form-response',
    Key: event.pathParameters.id,
    Body: event.body
  }, (err, res) => {
    console.log(err, res)
    callback(err, res)
  })
}
