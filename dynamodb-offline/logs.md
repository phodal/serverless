Serverless 架构应用开发：使用 serverless-offline 在本地部署与调试
===

在这几周的 Serverless 应用开发里，我觉得最大的不便就是，缺少一个本地的调试环境。在这种时候，我们需要不断地部署我们的代码，不断地在我们的代码里写上几行 ``console.log``，然后在一切正常之后，再把这些 ``console.log`` 删除。

可要是，突然间又出现了一个 bug，我仿佛看到了我们又要重来一遍。

就这样经历了几次之后，我便想尝试一些新的手段，比如 ``serverless-offline``。


serverless-offline
---

serverless-offline 是一个 Serverless Framework 的插件，它可以在本地的机器上模拟 AWS Lamdba 和 API Gateway，以加快开发者的开发周期。为此，它启动一个处理请求生命周期的 HTTP 服务器，就像 APIG 一样，并调用你的处理程序。

及包含以下的特性：

 - 仅支持 Node.js 下的 Lambda 函数
 - 支持 Velocity 模板
 - 延迟加载你的、需要缓存失效文件：而不需要重载工具，如Nodemon。
 - 以及，集成，授权人，代理，超时，responseParameters，HTTPS，Babel 运行时环境，CORS 等...

那么，让我们看看如何做到这一点。

本地搭建 serverless-offline 与 DynamoDB 环境
---

这次我们将基于之前的文章《[Serverless 应用开发指南：Lambda + API Gateway + DynamoDB 制作 REST API
](https://www.phodal.com/blog/serverless-developement-gui-lambda-api-gateway-dynamodb-create-restful-services/)》中的 todolist，来开始我们的调试之旅。

在之前的示例里，我们使用了 DynamoDB 来存储数据。在这篇文章里，我们也将介绍 ``serverless-dynamodb-local`` 来在本地运行 DynamoDB。

在那之前，如果你还没有之前的代码，请先安装服务到本地：

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/aws-node-rest-api-with-dynamodb -n dynamodb-offline
```

然后，在我们的项目里安装 ``serverless-offline`` 插件：

```
yarn add --dev serverless-offline
```

并安装 ``serverless-dynamodb-local`` 插件：

```
yarn add --dev serverless-dynamodb-local
```

然后，在 ``serverless.yml`` 中添加相应的插件：

```
plugins:
  - serverless-offline
  - serverless-dynamodb-local
```

紧接着，还需要进行相应的 dynamodb 配置：

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

其中的 migration 对应的是本地的 Scheme，位于 ``offline/migrations/todos.json``，内容如下：

```
{
    "Table": {
        "TableName": "serverless-rest-api-with-dynamodb-dev",
        "KeySchema": [
            {
                "AttributeName": "id",
                "KeyType": "HASH"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "id",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        }
    }
}
```

然后，执行：

```
serverless dynamodb install
```

以安装 DynamnoDB 的本地版本。

一切准备妥当了，我们可以进行测试了。


本地测试 serverless-offline 与 DynamoDB
---

接着，让我们用下面的命令，来运行起本地的环境：

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

启动的时候，发现直接报错了：

```
  message: 'Missing region in config',
  code: 'ConfigError',
  time: 2017-11-07T01:18:45.365Z }
```

对比了官方的示例代码后，发现没有对本地调用的 DynamoDB 进行处理：

让我们，新增一个 ``todos/dynamodb.js`` 文件：

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

当我们在本地运行的时候，将使用本地的 DynamoDB，当在服务端运行的时候，则会调用真正的 DynamoDB。

再去修改 ``create.js``、``delete.js``、``get.js``、``list.js`` 和 ``update.js`` 中的：

```
const dynamoDb = new AWS.DynamoDB.DocumentClient();
```

改为


```
const dynamoDb = require('./dynamodb');
```

确认一切无误后，我们就可以使用 postman 测试：

![PostMan 测试 Serverless Offline](./images/postman-offline-db)

或者 curl：

```
curl -X POST -H "Content-Type:application/json" http://localhost:3000/todos --data '{ "text": "Learn Serverless" }'
```

接着打开本地的 todos 地址：

```
http://localhost:3000/todos
```

就会返回类似于在线上生成的数据结果。

```
[{"checked":false,"createdAt":1510018445663,"id":"be15f600-c35b-11e7-8089-a5ea63a20ab5","text":"Learn Serverless","updatedAt":1510018445663}]
```

Awesome！

既然，已经有了可以在本地运行 DynamoDB，那么我们是不是可以写上几个测试呢？
