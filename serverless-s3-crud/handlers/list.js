'use strict'

const AWS = require('aws-sdk')
const S3 = new AWS.S3(require('../s3config.js')())

module.exports = (event, callback) => {
  S3.listObjectsV2({
    Bucket: 'form-response',
  }, (err, res) => {
    console.log(err, res)
    callback(err, res)
  })
}
