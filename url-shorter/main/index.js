'use strict';

// Example of lambda function using nunjucks template
// https://github.com/guardian/ses-send-email-lambda/blob/master/src/index.js

// Related interesting reads
// https://medium.com/engineers-optimizely/using-serverless-to-simplify-and-automate-aws-lambda-442addd80d72

const base_page = `<html>
<h1>Hi!</h1>
  <form method="POST" action="">
    <label for="uri">Link:</label>
    <input type="text" id="link" name="link" size="40" autofocus />
    <br/>
    <br/>
    <input type="submit" value="Shorten it!" />
  </form>
</html>`

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));

  callback(
    null,
    {
      statusCode: 200,
      body: base_page,
      headers: {'Content-Type': 'text/html'},
    }
  );
}
