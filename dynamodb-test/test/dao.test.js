require('should');

const mochaPlugin = require('serverless-mocha-plugin');
const expect = mochaPlugin.chai.expect;
const AWS = require('aws-sdk-mock');
const dynamoDb = require('../todos/dynamodb');

process.env.TABLE_NAME = 'SomeTable';

describe('Test ToDo DAO - save', () => {
  it('should save todo', () => {
    AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      params.should.be.an.Object();
      params.should.have.property('Item');
      params.Item.should.have.property('id', 'todoId');
      params.Item.should.have.property('text', 'ToDoText');
      params.Item.should.have.property('state', 'OPEN');
      params.should.have.property('TableName', 'SomeTable');

      callback(null, {});
    });

    return dynamoDb.put({}, (error) => {
      console.log(error);
      if (error) {
        return;
      }

      console.log('-');
      callback(null, {});
    })
  });

  afterEach(() => {
    AWS.restore();
  });

});
