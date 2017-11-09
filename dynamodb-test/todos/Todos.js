const dynamoDb = require('./dynamodb');

class Todos {
  constructor(todo) {
    this.db = dynamoDb;
    this.todo = todo;
  }

  create(todo, callback) {

  }

  delete(todo, callback) {

  }

  get(id, callback) {

  }

  list(callback) {

  }

  update(todo, callback) {

  }
}

module.exports = Todos;