require('should');

const mochaPlugin = require('serverless-mocha-plugin');
const expect = mochaPlugin.chai.expect;
const awsMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const dynamoDb = require('../todos/dynamodb');

describe('Test ToDo DAO - save', () => {
  it('should save todo', (done) => {
    awsMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      params.should.be.an.Object();
      params.should.have.property('Item');
      params.Item.should.have.property('id', 'todoId');
      params.Item.should.have.property('text', 'ToDoText');
      params.Item.should.have.property('checked', false);
      params.should.have.property('TableName', 'SomeTable');

      callback(null, {});
      done()
    });

    let dynamoDb = new AWS.DynamoDB.DocumentClient();
    return dynamoDb.put({
      TableName: 'SomeTable',
      Item: {
        id: 'todoId',
        text: 'ToDoText',
        checked: false
      },
    }).promise().then((data) => {
      console.log(data);
      return data;
    }).catch((error) => {
      console.log(error);
    })

  });

  afterEach(() => {
    awsMock.restore();
  });

});
