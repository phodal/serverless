使用 DynamoDB 数据库创建 REST API
===

原文链接：[Serverless 应用开发指南：Lambda + API Gateway + DynamoDB 制作 REST API](https://www.phodal.com/blog/serverless-developement-gui-lambda-api-gateway-dynamodb-create-restful-services/)

本文将介绍如何用 AWS Lambda + API Gateway + DynamoDB 创建一个 RESTful API 的示例。文中的示例是一个 TODO API 的示例，支持 GET、POST、PUT、DELETE 请求，即常规的 CRUD。


安装示例项目的命令如下：

```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-rest-api-with-dynamodb -n aws-node-rest-api-with-dynamodb
```

Serverless DynamoDB 示例配置
---

先让我们来看看 ``serverless.yml`` 中的几个重要部分。以下是项目及 dynamodb 的一些相应的配置：

```
provider:
  name: aws
  runtime: nodejs4.3
  environment:
    DYNAMODB_TABLE: ${self:service}-${opt:stage, self:provider.stage}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"
```

即我们配置了我们能用 dynamodb 所进行的操作。

在 functions 字段里，仍然是对应事件的处理。唯一不同的是，这次多了一个 ``cors`` 为 ture 的键值，如其字面意思：允许跨域请求。

```
functions:
  create:
    handler: todos/create.create
    events:
      - http:
          path: todos
          method: post
          cors: true
```          

相应的和之前的 s3 示例一样，也是对相应的资源进行配置，如表名，Scheme 等等。

```
resources:
  Resources:
    TodosDynamoDbTable:
      Type: 'AWS::DynamoDB::Table'
      DeletionPolicy: Retain
      Properties:
        AttributeDefinitions:
          -
            AttributeName: id
            AttributeType: S
        KeySchema:
          -
            AttributeName: id
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
```

Serverless DynamoDB 示例代码
---

接着，让我们来看看一下简单的 ``get`` 操作的例子：

```
'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
```

在代码里，首先我们引入了 aws-sdk，然后创建了一个 DynamoDB 客户端。在 get 函数里，我们将从 ``event`` 对象中获取到路径参数，并取出其中的 id。随后，到数据库中查找是否有相应的 id。

 - 如果有，就返回 200 及对应的内容。
 - 如果没有，则返回一个 501 异常。

除了 create.js 方法中，使用了 uuid 用来生成唯一的 ID。考虑到其它代码与我们正常的 CRUD 并没有多大不同，就不详细展开了。

Serverless DynamoDB 部署
---

```
npm install
```


```
serverless deploy
```

生成的对应数据如下：

```
......................................................................................................
Serverless: Stack update finished...
Service Information
service: serverless-rest-api-with-dynamodb
stage: dev
region: us-east-1
stack: serverless-rest-api-with-dynamodb-dev
api keys:
  None
endpoints:
  POST - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  PUT - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  DELETE - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
functions:
  create: serverless-rest-api-with-dynamodb-dev-create
  list: serverless-rest-api-with-dynamodb-dev-list
  get: serverless-rest-api-with-dynamodb-dev-get
  update: serverless-rest-api-with-dynamodb-dev-update
  delete: serverless-rest-api-with-dynamodb-dev-delete
```

Serverless DynamoDB 测试
---

我们使用的测试脚本仍然和之前的一样，也相当的简单。以下是创建的命令：

```
curl -X POST https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "Learn Serverless" }'
```

生成的数据如下：

```
{
 "id": "bc74f220-bcb6-11e7-ada2-5b0b42425b91",
 "text": "Learn Serverless",
 "checked": false,
 "createdAt": 1509287868994,
 "updatedAt": 15092878689![94
}][1]
```

让我们再创建一条：

```
 curl -X POST https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "update totdolists" }'
```

这些都可以在数据库中，查看到对应的数据，如下所示：

![DynamoDB 示例](images/dynamodb-console-log.png)

其它操作
---

然后查看所有的：

```
curl https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos
```

或者更新某一条：

```
curl -X PUT https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/1 --data '{ "text": "Learn Serverless", "checked": true }'
```

删除某一条:

```
curl -X DELETE https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/1
```

对了，没事得删除。。。考虑到我之前的 500 刀的经历，记得：

```
serverless remove
```
