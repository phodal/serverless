// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');
var token = jwt.sign({ email: 'h@phodal.com', password: "phodal" }, 'shhhhh');

console.log(token);