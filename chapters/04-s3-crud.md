为基于 S3 的网站支持 CRUD
===

原文链接：[Serverless 应用开发指南：API Gateway + S3 + AWS Lambda 打造 CRUD](https://www.phodal.com/blog/serverless-development-guide-use-s3-api-gateway-create-crud/)

在前两篇文章《Serverless 应用开发指南： serverless 的 hello, world》和 《[Serverless 开发指南：AWS IoT 服务开发](https://www.phodal.com/blog/serverless-guide-development-aws-iot-serverless-example/)》 里，我们简单地介绍了如何用 Serverless 和 AWS IoT 开发入门级的 Serverless 应用。

在这一篇文章里，我们将开始进入正式的应用开发领域里：一个 CRUD 示例。

原先，我考虑直接先使用 DynamoDB 进行实验，但是考虑到我之前误用 DynamoDB 被扣 500 刀，再追回来的经历。我决定先用 S3 练练手——主要是已经有一个成型的 DEMO。


概念：API Gateway 与 S3 
---

以下是来自官网对于 API Gateway 和 S3 的介绍：

> Amazon API Gateway 是一种完全托管的服务，可以帮助开发者轻松创建、发布、维护、监控和保护任意规模的 API。只需在 AWS 管理控制台中点击几下，您便可以创建可充当应用程序“前门”的 API，从后端服务访问数据、业务逻辑或功能，例如基于 Amazon Elastic Compute Cloud (Amazon EC2) 运行的工作负载、基于 AWS Lambda 运行的代码或任意 Web 应用。Amazon API Gateway 负责管理所有任务，涉及接受和处理成千上万个并发 API 调用，包括流量管理、授权和访问控制、监控以及 API 版本管理。Amazon API Gateway 没有最低费用或启动成本，您只需为收到的 API 调用和传输出去的数据量付费。

> Amazon S3 将数据作为对象存储在被称为“存储桶”的资源中。您可以在一个存储桶中尽可能多地存储对象，并写入、读取和删除您的存储桶中的对象。对象大小最多可为 5 TB。


简单地来说，API Gateway 就是那个 API gateway，即所有 API 请求的入口。而 S3 就存储内容的部分——可以视作为云盘。

基于 S3 的 Serverless CRUD
---

为了使用 S3，我们需要引入 aws-sdk 库来帮助我们更好的编写 AWS 应用。接着，让我们引入这个服务：

```
serverless install --url https://github.com/tscanlin/serverless-s3-crud
```

然后，到目录中，安装依赖：

```
cd serverless-s3-crud
npm install
```

再执行部署：

```
serverless deploy
```

执行的时候，发现了：

```
  Serverless Error ---------------------------------------

  An error occurred: MyBucket - form-response already exists.

  Get Support --------------------------------------------
     Docs:          docs.serverless.com
     Bugs:          github.com/serverless/serverless/issues
     Forums:        forum.serverless.com
     Chat:          gitter.im/serverless/serverless

  Your Environment Information -----------------------------
     OS:                     darwin
     Node Version:           6.11.0
     Serverless Version:     1.23.0
```

啊哈，这个 MyBucket 已经存在了，这意味着，我们需要改一个新的名字。打开 ``serverless.yml`` 文件，将其中的 16、22、72 行中的 from-response 改成你想要的名字，如 ``phodal-serverless``。

以及** handlers 目录下的各个文件的 Bucket 名**。

serverless.yml 代码中的 ``iamRoleStatements`` 用于设置 serverless 的权限，Action 代码其所能进行的操作，Resource 则是相应的资源：

```
  iamRoleStatements:
    - Effect: Allow
      Action:
        - s3:ListBucket
      Resource: "arn:aws:s3:::phodal-serverless"
    - Effect: Allow
      Action:
        - s3:PutObject
        - s3:GetObject
        - s3:DeleteObject
      Resource: "arn:aws:s3:::phodal-serverless/*"
```

下面的代码则定义了，我们的资源，所使用的存储桶（BucketName）的名字：

```
resources:
  Resources:
    MyBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: phodal-serverless
        AccessControl: PublicReadWrite
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: error.html
```

然后再执行 ``serverless deploy``，就会返回我们想要的结果及 API 地址：

```
api keys:
  None
endpoints:
  POST - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
  GET - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response
  GET - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/readAll
  GET - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
  PUT - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
  DELETE - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
functions:
  create: serverless-crud-s3-dev-create
  list: serverless-crud-s3-dev-list
  readAll: serverless-crud-s3-dev-readAll
  readOne: serverless-crud-s3-dev-readOne
  update: serverless-crud-s3-dev-update
  delete: serverless-crud-s3-dev-delete
```

上面列出了所有端口的 API 地址，

上传原理
---


那么，它是怎么进行操作的呢，先看看 ``serverless.yml`` 文件中定义的 create 动作。

```
functions:
  create:
    handler: handler.create
    events:
      - http:
          path: form-response/{id}
          method: post
          cors: true
```

对应了 ``handler.js`` 文件中的 create 方法：

```
const Create = require('./handlers/create.js')
...

function makeResponse(error, result) {
  const statusCode = error && error.statusCode || 200
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify(result),
  }
}

exports.create = (event, context, callback) => {
  Create(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}
```

对应的 create 操作，即是：

```
'use strict'

const AWS = require('aws-sdk')
const S3 = new AWS.S3(require('../s3config.js')())

module.exports = (event, callback) => {
  S3.upload({
    Bucket: 'phodal-serverless',
    Key: event.pathParameters.id,
    Body: event.body,
    // ACL: 'public-read-write' // TODO: Make this an option.
  }, (err, res) => {
    console.log(err, res)
    callback(err, res)
  })
}
```

我们就是在这里上传数据到 S3 的。

Serverless S3 CRUD 示例
---

一个简单的方式是使用 curl：

```
curl -X POST https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/1 --data '{ "body" : "Learn Serverless" }'
```

```
{
    "ETag": "\"695827e7012d367b7e7a28a3fdf7ce06\"",
    "Location": "http://s3.amazonaws.com/phodal-serverless/1",
    "key": "1",
    "Key": "1",
    "Bucket": "phodal-serverless"
}
```

然后同样的可以通过 curl 来获取：

```
curl https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response
```

就是这么简单。

如果只是测试用途，可以在执行完成后执行 serverless remove 来删除对应的服务，以减少开支。
