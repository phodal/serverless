const awsServerlessExpress = require('aws-serverless-express')
const app = require('./index')
const server = awsServerlessExpress.createServer(app)

exports.runserver = (event, context) => {
   console.log("EVENT: " + JSON.stringify(event));
   awsServerlessExpress.proxy(server, event, context)
}
