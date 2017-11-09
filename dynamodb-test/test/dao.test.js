require('should');

const mochaPlugin = require('serverless-mocha-plugin');
const expect = mochaPlugin.chai.expect;
const AWS = require('aws-sdk-mock');
const dynamoDb = require('../todos/dynamodb');

process.env.TABLE_NAME = 'SomeTable';

describe('Test ToDo DAO - save', () => {
  it('should save todo', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      console.log(params);
      params.should.be.an.Object();
      params.should.have.property('Item');
      params.Item.should.have.property('id', 'todoId');
      params.Item.should.have.property('text', 'ToDoText');
      params.Item.should.have.property('checked', false);
      params.should.have.property('TableName', 'SomeTable');

      callback(null, {});
      done()
    });

    return dynamoDb.put({
      TableName: 'SomeTable',
      Item: {
        id: 'todoId',
        text: 'ToDoText',
        checked: false
      },
    }).promise().then((data) =>{
      console.log(data);
    })

  });

  afterEach(() => {
    AWS.restore();
  });

});
