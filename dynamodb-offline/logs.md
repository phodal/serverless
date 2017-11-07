

```
yarn add --dev serverless-offline
yarn add --dev serverless-dynamodb-local
```

在 ``serverless.yml`` 中添加相应的插件：

```
plugins:
  - serverless-offline
  - serverless-dynamodb-local
```

及配置：

```
custom:
  dynamodb:
    start:
      port: 8000
      inMemory: true
      migrate: true
    migration:
      dir: offline/migrations
```

migration 对应的是本地的 Scheme。

执行：

```
serverless dynamodb install
```

来安装 DynamnoDB 的本地版本。



```
$ serverless offline start

Dynamodb Local Started, Visit: http://localhost:8000/shell
Serverless: DynamoDB - created table serverless-rest-api-with-dynamodb-dev
Serverless: Starting Offline: dev/us-east-1.

Serverless: Routes for create:
Serverless: POST /todos

Serverless: Routes for list:
Serverless: GET /todos

Serverless: Routes for get:
Serverless: GET /todos/{id}

Serverless: Routes for update:
Serverless: PUT /todos/{id}

Serverless: Routes for delete:
Serverless: DELETE /todos/{id}

Serverless: Offline listening on http://localhost:3000
```

报错：

```
  message: 'Missing region in config',
  code: 'ConfigError',
  time: 2017-11-07T01:18:45.365Z }
```

```
export SERVERLESS_REGION=us-east-1
```

对比后，发现代码少了一部分：

新增一个 ``todos/dynamodb.js`` 文件：

```
'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = client;
```

然后修改 ``create.js``、``delete.js``、``get.js``、``list.js`` 和 ``update.js`` 中的：

```
const dynamoDb = new AWS.DynamoDB.DocumentClient();
```

改为


```
const dynamoDb = require('./dynamodb');
```


测试
---


使用 postman 测试：

![PostMan 测试 Serverless Offline](./images/postman-offline-db)

或者 curl：

```
curl -X POST -H "Content-Type:application/json" http://localhost:3000/todos --data '{ "text": "Learn Serverless" }'
```


```
http://localhost:3000/todos
```

```
[{"checked":false,"createdAt":1510018445663,"id":"be15f600-c35b-11e7-8089-a5ea63a20ab5","text":"Learn Serverless","updatedAt":1510018445663}]
```
