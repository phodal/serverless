'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
AWS.config.setPromisesDependency(Promise);
const docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

module.exports.pub = (event, context, callback) => {
  const item = _.pick(JSON.parse(event.body),
      ['acc', 'alt', 'batt', 'cog', 'desc', 'event', 'lat', 'lon', 'rad', 't',
      'tid', 'tst', 'vac', 'vel', 'p', 'conn']);
  if (event.queryStringParameters)
    Object.assign(item, _.pick(event.queryStringParameters, ['u', 'd']))
  if (event.headers['X-Limit-U'])
    item.u = event.headers['X-Limit-U']
  if (event.headers['X-Limit-D'])
    item.d = event.headers['X-Limit-D']

  docClient.putAsync({
    TableName: process.env.table,
    Item: item
  }).then(() => callback(null, {statusCode:200, body: '[]'}))
    .catch(() => callback(null, {statusCode:400, body: '[]'}));
};

const getCoordinates = (tid, tst) => {
  return docClient.queryAsync({
    TableName: process.env.table,
    KeyConditionExpression: 'tid = :tid and tst > :tst',
    ExpressionAttributeValues: {
      ':tid': tid,
      ':tst': parseInt(tst) || (Date.now() / 1000) - 60 * 60 * 12,
    },
  });
}

module.exports.points = (event, context, callback) => {
  getCoordinates(event.pathParameters.tid, event.queryStringParameters && event.queryStringParameters.tst)
    .then((data) => callback(null, {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin' : '*'},
      body: JSON.stringify({
        type: 'FeatureCollection',
        features: data.Items.map((item) => {return {
          type: 'Feature',
          geometry: {type: 'Point', coordinates: [item.lon, item.lat]},
          properties: _.omit(item, ['lat', 'lon']),
        };}),
      }),
    }))
  .catch((err) => callback(null, {statusCode: 500, body: JSON.stringify(err)}))
};


module.exports.linestring = (event, context, callback) => {
  getCoordinates(event.pathParameters.tid, event.queryStringParameters && event.queryStringParameters.tst)
    .then((data) => callback(null, {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin' : '*'},
      body: JSON.stringify({
        type: 'LineString',
        coordinates: data.Items.map((item) => [item.lon, item.lat]),
      }),
    }))
  .catch(() => callback(null, {statusCode: 500}))
};
