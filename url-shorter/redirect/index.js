'use strict';

const AWS = require('aws-sdk');

const tableName = process.env.DYNAMODB_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));

  const slug = event.pathParameters.slug;

  docClient.get({
    TableName: tableName,
    Key: {
      slug: slug
    }
  }, (err, data) => {
    console.log(data);

    if (err) {
      console.log(err);
      return callback(err);
    }

    const item = data.Item;

    if (item && item.url) {
      callback(
        null,
        {
          statusCode: 302,
          body: item.url,
          headers: {
            'Location': item.url,
            'Content-Type': 'text/plain'
          }
        }
      )
    } else {
      callback(
        null,
        {
          statusCode: 404,
          body: "Shortened URL doesn't exist!",
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      )
    }
  });
}
