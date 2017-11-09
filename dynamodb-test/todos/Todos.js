const dynamoDb = require('./dynamodb');

class Todos {
  constructor(todo) {
    this.db = dynamoDb;
    this.todo = todo;
  }

  create(todo, callback) {

  }
}

module.exports = Todos;