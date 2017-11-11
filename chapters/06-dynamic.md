AWS Lambda 动态 HTML 编程
===

原文链接：[Serverless 应用开发指南： Node.js 编程返回动态 HTML](https://www.phodal.com/blog/serverless-development-guide-nodejs-create-dymamic-html/)


在我们进行 Serverless + SPA 应用开发之前，先看看官方的相应 DEMO。


```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-serve-dynamic-html-via-http-endpoint -n node-serve-html
```

然后执行部署

```
serverless deploy
```

``serverless.yml`` 文件，如下：

```
# Serving HTML through API Gateway for AWS Lambda
service: node-serve-html

frameworkVersion: ">=1.1.0 <2.0.0"

provider:
  name: aws
  runtime: nodejs4.3

functions:
  landingPage:
    handler: handler.landingPage
    events:
      - http:
          method: get
          path: landing-page
```          

对应的，我们的 ``handler.js`` 文件：


```
'use strict';

module.exports.landingPage = (event, context, callback) => {
  let dynamicHtml = '<p>Hey Unknown!</p>';
  // check for GET params and use if available
  if (event.queryStringParameters && event.queryStringParameters.name) {
    dynamicHtml = `<p>Hey ${event.queryStringParameters.name}!</p>`;
  }

  const html = `
  <html>
    <style>
      h1 { color: #73757d; }
    </style>
    <body>
      <h1>Landing Page</h1>
      ${dynamicHtml}
    </body>
  </html>`;

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };

  // callback is sending HTML back
  callback(null, response);
};
```

上面的代码所做的就是，当我们对 ``landing-page`` 发出请求的时候，便执行上面的 ``landingPage`` 代码。然后返回对应的 HTML body、statusCode、headers。

相应的部署日志如下：

```
..............................
Serverless: Stack update finished...
Service Information
service: node-serve-html
stage: dev
region: us-east-1
stack: node-serve-html-dev
api keys:
  None
endpoints:
  GET - https://uocym5fe3m.execute-api.us-east-1.amazonaws.com/dev/landing-page
functions:
  landingPage: node-serve-html-dev-landingPage
```

然后我们访问：[https://uocym5fe3m.execute-api.us-east-1.amazonaws.com/dev/landing-page](https://uocym5fe3m.execute-api.us-east-1.amazonaws.com/dev/landing-page?name=phodal)，就会返回对应的 HTML，即：

```
Landing Page

Hey phodal!
```
