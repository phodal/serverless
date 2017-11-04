'use strict';

const AWS = require('aws-sdk');

module.exports.receiver = (event, context, callback) => {
  const data = event.data;
  const firehose = new AWS.Firehose();

  const params = {
    Record: {
      Data: data
    },
    DeliveryStreamName: 'serverless-firehose'
  };

  return firehose.putRecord(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(null, { message: 'Data successfully written to Kinesis stream "data-receiver"' });
  });
};
