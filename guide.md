Serverless（无服务器架构）应用开发指南
===

> Serverless 架构是指大量依赖第三方服务(也叫做后端即服务，即“BaaS”)或暂存容器中运行的自定义代码(函数即服务，即“FaaS”)的应用程序，函数是无服务器架构中抽象语言运行时的最小单位。在这种架构中，我们并不看重运行一个函数需要多少 CPU 或 RAM 或任何其他资源，而是更看重运行函数所需的时间，我们也只为这些函数的运行时间付费。[^serverless]

[^serverless]: http://www.infoq.com/cn/news/2017/04/2017-Serverless

``注意事项``

在本系列的文章中，主要采用了 Serverless Framework 来简化开发和部署流程。

> Serverless Framework是无服务器应用框架和生态系统，旨在简化开发和部署AWS Lambda应用程序的工作。Serverless Framework 作为 Node.js NPM 模块提供，填补了AWS Lambda 存在的许多缺口。它提供了多个样本模板，可以迅速启动 AWS Lambda 开发。

Serverless 应用开发指南：serverless 的 hello, world
===

原文链接：[Serverless 应用开发指南：serverless 的 hello, world](https://www.phodal.com/blog/serverless-development-guid-serverless-framework-hello-world/)

在翻译了几篇 serverless 与物联网相关的文章之后，我开始想着好好掌握一下 serverless 的相关知识。

我对于 serverless 的第一认知是：**Serverless 是由一堆云服务构建后端服务的，如存储、计算、授权都是由不同的服务来构建的。**而作为一个开发人员，我们所要做的就是了解如何搭配不同的云服务。

因此，在进行更多的定义之前，我打算先熟悉一下 serverless，以便于我更好地了解什么是 serverless 应用开发。

Serverless 框架 hello, world
---

考虑到直接使用 aws lambda 编写 serverless，对于我这样的新手相当的有挑战性。于是，我便先选择了 Serverless 框架，GitHub: https://github.com/serverless/serverless。

先让我们按官网的 demo，进行实验。开始之前，除了拥有一台电脑，你还需要有一个 AWS 账号。AWS 提供一年的免费试用，你所需要做的就是办一张支持 visa 的信用卡。

### 一、安装  serverless 框架

```
npm install -g serverless
```

或者，和我一样使用：

```
yarn global add serverless
```

### 二、设置 aws 凭证。

1.登录 AWS 账号，然后点击进入 IAM  (即，Identity & Access Management)。

2.点击用户，然后添加用户，如 serveless-admin，并在『选择 AWS 访问类型』里，勾上**编程访问**。

![编程访问 serverless](images/enable-programming.png)

3.点击**下一步权限**，选择『直接附加现有策略』，输入**AdministratorAccess**，然后创建用户。

``注意``：由于是 **AdministratorAccess** 权限，所以不要泄漏你的密钥出去。

4. 创建用户。随后，会生成**访问密钥 ID** 和 **私有访问密钥**。请妥善保存好。

然后导出证书，并使用 ``serverless depoy`` 保存到本地。

```
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>

serverless deploy
```

将会自动生成配置到 ~/.aws/credentials

或者，如官方的示例：

```
serverless config credentials --provider aws --key AKIAIOSFODNN7EXAMPLE --secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 三、创建 hello-world 服务

```
serverless create --template aws-nodejs --path hello-world
```

```
Serverless: Generating boilerplate...
Serverless: Generating boilerplate in "/Users/fdhuang/learing/serverless-guide/hello-world"
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.23.0
 -------'

Serverless: Successfully generated boilerplate for template: "aws-nodejs"
(play-env)
```

生成两个文件；

```
├── handler.js
└── serverless.yml
```

其中的 handler.js 的内容是：

```
'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
```

而 ``serverless.yml`` 的内容，因为注释所有的内容，因此相当于是空的。

### 四、部署及测试：

```
$serverless deploy -v
```

日志如下：

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (409 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
CloudFormation - UPDATE_IN_PROGRESS - AWS::CloudFormation::Stack - hello-world-dev
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_COMPLETE - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_COMPLETE - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - HelloLambdaVersionPSzzisjnTvvYknuXwQOlAvdkQZ67qXYSvgoAi9T8W0
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - HelloLambdaVersionPSzzisjnTvvYknuXwQOlAvdkQZ67qXYSvgoAi9T8W0
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Version - HelloLambdaVersionPSzzisjnTvvYknuXwQOlAvdkQZ67qXYSvgoAi9T8W0
CloudFormation - UPDATE_COMPLETE_CLEANUP_IN_PROGRESS - AWS::CloudFormation::Stack - hello-world-dev
CloudFormation - UPDATE_COMPLETE - AWS::CloudFormation::Stack - hello-world-dev
Serverless: Stack update finished...
Service Information
service: hello-world
stage: dev
region: us-east-1
stack: hello-world-dev
api keys:
  None
endpoints:
  None
functions:
  hello: hello-world-dev-hello

Stack Outputs
HelloLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:706605665335:function:hello-world-dev-hello:1
ServerlessDeploymentBucketName: hello-world-dev-serverlessdeploymentbucket-bk066p5c9zgl
```

然后，让我们来触发一下这个函数：

```
$ serverless invoke -f hello -l
```

服务器返回了下面的结果：

```
{
    "statusCode": 200,
    "body": "{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":{}}"
}
--------------------------------------------------------------------
START RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d Version: $LATEST
END RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d
REPORT RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d	Duration: 2.49 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 20 MB
```

这意味着，我们的第一个服务已经成功上线了。

我们也可以通过下面的命令来获取相应的日志：

```
serverless logs -f hello -t
```

Serverless 应用开发指南： Node.js 编程返回动态 HTML
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

Serverless 应用开发指南：API Gateway + S3 + AWS Lambda 打造 CRUD
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


Serverless 开发指南：AWS IoT 服务开发
===

原文链接：[Serverless 开发指南：AWS IoT 服务开发](https://www.phodal.com/blog/serverless-guide-development-aws-iot-serverless-example/)

在我开发一个完整的 Serverless 应用之前，我决定尝试一下不同的 Serverless 服务。这次我打算结合一下 AWS IoT，作为我对云服务与物联网结合的探索。

Serverless 框架安装服务
---

依旧的，我还将继续使用 Serverless 框架，而不是自己写 lambda 来实现。

因此，首先，让我们使用官方的服务 demo，执行以下的命令，就可以在本地复制远程的 demo 到本地。 

```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-iot-event -n aws-iot-example
```

其相当于将远程的 https://github.com/serverless/examples/tree/master/aws-node-iot-event 复制到本地的 ``aws-iot-example``

这次我们的 ``handler.js`` 只是打了个日志，其它什么也没做。

```
'use strict';

module.exports.log = (event, context, callback) => {
  console.log(event);
  callback(null, {});
};
```

重点还在于 ``serverless.yml`` 文件中的配置：

```
service: aws-node-iot-event

frameworkVersion: ">=1.5.0 <2.0.0"

provider:
  name: aws
  runtime: nodejs4.3

functions:
  log:
    handler: handler.log
    events:
      - iot:
          sql: "SELECT * FROM 'mybutton'"
```

在这个 ``CloudFormation`` 配置文件中，我们设置了运行配置 nodejs4.3，以及对应的 ``handler.log`` 函数 。在 ``events`` 里，写了一个 sql 语句来选择 ``mybutton`` 的相关内容，即查看 mybutton 相关主题的日志。

部署 AWS IoT Serverless 服务
---

依旧的我们只需要执行 ``serverless deploy`` 即可：

```
.................
Serverless: Stack update finished...
Service Information
service: aws-iot-example
stage: dev
region: us-east-1
stack: aws-iot-example-dev
api keys:
  None
endpoints:
  None
functions:
  log: aws-iot-example-dev-log
```

完成部署后， 我们就可以在 AWS Lambda 后台看到我们的相关函数：

![Serverless 控制台](images/server-side-example.png)

然后打开 AWS IoT 控制台，进入『测试』，即 MQTT 客户端页面：

![AWS IoT MQTT 测试页面](images/aws-iot-mqtt-test.png)

接着在发布主题里，填入 ``mybutton``，然后输入以下的内容：

```
{
  "message": "My first IoT event",
  "value": 2
}
```

如下图所示：

![AWS IoT 发布主题](images/aws-iot-mqtt-test.png)

查看日志
---

然后执行以下的命令，我们就可以查看到对应的日志：

```
$ serverless logs --function log
```

内容如下所示：

```
START RequestId: 76ad40d4-bc84-11e7-885a-6182fb121f8c Version: $LATEST
2017-10-29 16:37:57.481 (+08:00)	76ad40d4-bc84-11e7-885a-6182fb121f8c	{ message: 'My first IoT event', value: 2 }
END RequestId: 76ad40d4-bc84-11e7-885a-6182fb121f8c
REPORT RequestId: 76ad40d4-bc84-11e7-885a-6182fb121f8c	Duration: 68.80 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 22 MB
```

如果只是测试用途，可以在执行完成后执行 ``serverless remove`` 来删除对应的服务，以减少开支。

Serverless 应用开发指南：使用 S3 部署静态网站
===

原文链接：[Serverless 应用开发指南：使用 S3 部署静态网站](https://www.phodal.com/blog/serverless-development-guide-use-serverless-finch-deploy-s3-static-html/)

在尝试了使用 Router53 路由到 S3 后，并想试试能否使用 serverless 框架来上传静态内容。在探索官方的 DEMO 后，找到了一个 ``serverless-finch`` 插件可以做相应的事情。

```
serverless create --template aws-nodejs s3-static-file s3-static-file
```

配置 serverless-finch
---

官网的 ``serverless-client-s3`` 已经停止维护了，并推荐使用 ``serverless-finch``。

``serverless-finch`` 的安装方式是：

```
npm install --save serverless-finch
```

默认的官网生成的项目，并没有 ``package.json`` 文件，需要手动执行 ``npm inti``，再安装插件。

因此修改完后的 ``package.json`` 文件如下所示：

```
{
  "name": "s3-static-file",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Phodal Huang",
  "license": "MIT",
  "dependencies": {
    "serverless-finch": "^1.1.1"
  }
}
```

在这个时候，我们需要按 serverless 框架的插件要求，添加如下的内容：

```
plugins:
  - serverless-finch
```

并配置好我们的 S3 存储桶的名字，最后 ``serverless.yml`` 文件的内容如下所示：

```
service: s3-static-file


plugins:
  - serverless-finch

provider:
  name: aws
  runtime: nodejs6.10

custom:
  client:
    bucketName: wdsm.io
```

我们配置的 S3 存储桶的名字是: **wdsm.io**，然后其使用 ``client/dist`` 文件来放置静态文件。

静态内容
---

如我们的 ``index.html`` 文件的路径是： ``client/dist/index.html``，对应的内容是：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WDSM.io</title>
</head>
<body>
 	<h1>WDSM</h1>
</body>
</html>
```

最后，执行 ``serverless client deploy`` 就可以部署我们的网站。

``再次提醒``，这次我们用的是 ``serverless client deploy``。

相应的过程日志如下所示：

```
Serverless: Deploying client to stage "dev" in region "us-east-1"...
Serverless: Bucket wdsm.io exists
Serverless: Listing objects in bucket wdsm.io...
Serverless: Deleting all objects from bucket wdsm.io...
Serverless: Configuring website bucket wdsm.io...
Serverless: Configuring policy for bucket wdsm.io...
Serverless: Configuring CORS policy for bucket wdsm.io...
Serverless: Uploading file error.html to bucket wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/wdsm.io/error.html
Serverless: Uploading file index.html to bucket wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/wdsm.io/index.html
```

由于配置了 Router53 指向了 S3，因此可以直接访问：[http://wdsm.io/](http://wdsm.io/) 来看最后的内容。

并且，对应的删除命令也变成了：``serverless client remove``。

Serverless 应用开发指南：Lambda + API Gateway + DynamoDB 制作 REST API
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

Serverless 应用开发指南：Serverless + Express 的 React 服务端渲染
===

原文链接：[Serverless 应用开发指南：Serverless + Express 的 React 服务端渲染](https://www.phodal.com/blog/serverless-development-guide-express-react-build-server-side-rendering/)  

我们已经可以用 AWS Lambda 来动态返回 HTML 了。在阅读了一系列的文章后，也发现了 Express 可以在 Lambda 上运行。当我们可以运行 Express 的时候，也意味着，它可以进行服务端渲染，即我们可以做  React 的服务端渲染。

于是，便有了这篇文章，也有了我创建的第一个 serverless 的项目：[serverless-react-server-side-render](https://github.com/phodal/serverless-react-server-side-render)。

对于这个项目来说，主要分成了三个步骤：

 - 在 AWS Lambda 上运行 Express
 - Express + React 进行服务端渲染
 - 配置 Webpack 来打包 React

Serverless + Express
---

要 AWS Lambda 上运行 Express，其实也是很简单的，按官方的 DEMO 来。

最先我尝试的是 Serverless Frameworks 官方提供的 Express 应用的示例代码：

```
// index.js

const serverless = require('serverless-http');
const express = require('express')
const app = express()

app.get('/', function (req, res) {
      res.send('Hello World!')
})

module.exports.handler = serverless(app);
```

但是这个示例有一个小问题，即我不能在本地运行我的 Express 应用。在探索的时候，我找到了 AWS Lab 提供的 ``aws-serverless-express`` 库。这个库的用法如下：

```
// index.js

const express = require('express')
const app = express()

app.get('/', function (req, res) {
      res.send('Hello World!')
})

app.listen(8080);
module.exports = app;
```

对应的，我们就可以抽象出调用 ``lambdal`` 函数。

```
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./index')
const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {
   console.log("EVENT: " + JSON.stringify(event));
   awsServerlessExpress.proxy(server, event, context)
}
```

那么，我们的 ``serverless.yml`` 就很简单了：

```
service: serverless-react-boilerplate

provider:
  name: aws
  runtime: nodejs6.10
  stage: dev
  region: us-east-1

functions:
  lambda:
    handler: lambda.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

记得在你的 ``package.json`` 中添加以下的内容：

```
 "dependencies": {
    "aws-serverless-express": "^3.0.2",
    "express": "^4.16.2"
}
```

然后，就可以愉快地执行 ``serverless deploy`` 了。

下一步，就是引入 React。


Express + React 进行服务端渲染
---

然后，我开始寻找一个合适的 Serverless 模板，比如：https://github.com/Roilan/react-server-boilerplate。

引入 React 之后， 我们的 ``index.js`` 文件如下所示：

```
const express = require('express')
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app';
import template from './template';

const app = express()

app.get('/', function (req, res) {
	const isMobile = true;
	const initialState = { isMobile };
	const appString = renderToString(<App {...initialState} />);

	res.send(template({
	  body: appString,
	  title: 'Hello World from the server',
	  initialState: JSON.stringify(initialState)
	}));
})

server.listen(8080);
module.exports = app;
```

代码本身是没有什么特别的，对应的 ``webpack.config.js`` 也稍微做了一些变化，即要打包的代码指向了我们的 ``lambda.js`` 文件。

```
module.exports = [
  {
    entry: './src/lambda.js',
    output: {
      path: './dist',
      filename: 'lambda.js',
      libraryTarget: 'commonjs2',
      publicPath: '/'
    },
    target: 'node',
...
```

同样的，对于我们的 ``serverless.yml`` 文件来，调用的路径也变了——使用打包后的 lambda 文件。

```

functions:
  lambda:
    handler: dist/lambda.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

其它代码没有太大的差异。

随后，我们就可以进行我们的第二次部署了：``serverless deploy``。

```
..............
Serverless: Stack update finished...
Serverless: Invoke aws:info
Service Information
service: serverless-react-boilerplate
stage: dev
region: us-east-1
stack: serverless-react-boilerplate-dev
api keys:
  None
endpoints:
  ANY - https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  lambda: serverless-react-boilerplate-dev-lambda
Serverless: Invoke aws:deploy:finalize
```

最后访问 [https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev](https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev) 就可以读取到返回的 HTML，如：

```
<!DOCTYPE html>
<html>
  <head>
    <script>window.__APP_INITIAL_STATE__ = {"isMobile":true}</script>
    <title>Hello World from the server</title>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  
  <body>
    <div id="root"><div data-reactroot="" data-reactid="1" data-react-checksum="-526830126"><h1 data-reactid="2"><!-- react-text: 3 -->hello world <!-- /react-text --><!-- react-text: 4 -->mobile<!-- /react-text --></h1></div></div>
  </body>
  
  <script src="/assets/bundle.js"></script>
</html>
```

结果看上去，有点不如我们的预期，显示的内容是『hello world mobile』。不过，至少代表了我们的代码是 work 的。

从目前的情况来看，仍然有很大的改进空间，如 webpack 版本过低、React 使用的是 15.6.2。但是 it works。

末了，记得使用 ``serverless remove`` 来省点钱。

Serverless 应用开发指南：CRON 定时执行 Lambda 任务
===

原文链接：[Serverless 应用开发指南：CRON 定时执行 Lambda 任务](https://www.phodal.com/blog/serverless-development-guide-cron-scheduled-job/)

在上一篇文章《[Serverless 应用开发指南：基于 Serverless 的 GitHub Webhook](https://www.phodal.com/blog/serverless-development-guide-create-github-hooks/)》里，我们介绍了如何用 Webhook 来触发定时的 Lambda 函数。这种方式与我们平时的 CI（持续集成）服务器相似，而CI（持续集成）服务器除了会监听 PUSH 事件。还会执行一些定时的任务，比如说每日构建出二进制包，用于 RELEASE。

因此，在这篇文章里，我将简单地介绍一下：如何定时触发 Lambda 任务。

Serverless 定时任务
---

幸运的是，带着我的想法，我在官网上看到了一个相关的事例。

于是，让我们安装一下这个服务到本地：

```
$ serverless install -u https://github.com/serverless/examples/tree/master/aws-node-scheduled-cron -n scheduled-cron
```

### rate 表达式

主要的定时代码写在 ``serverless.yml`` 文件中，如下所示：

```
functions:
  cron:
    handler: handler.run
    events:
      # Invoke Lambda function every minute
      - schedule: rate(1 minute)
```

AWS 支持两种类型的定时任务 ``rate`` 和 ``cron``。

Rate 表达式在创建计划事件规则时启动，然后按照其定义的计划运行。Rate 表达式有两个必需字段。这些字段用空格分隔。

```
rate(value unit)
```

相应的值表示如下：

 - value，正数（ >0 的数）。
 - unit，时间单位。其有效值：minute | minutes | hour | hours | day | days

因此，上面的代码 ``rate(1 minute)`` 表示的是每一分钟执行一次。

### cron 表达式

下面的代码，则使用的是 cron 表达式

```
  secondCron:
    handler: handler.run
    events:
      # Invoke Lambda function every 2nd minute from Mon-Fri
      - schedule: cron(0/2 * ? * MON-FRI *)
```

cron 表达式的格式稍微复杂一些。但是它与 Linux 上的 cron 是不太一样的：

```
cron(<分钟> <小时> <日期> <月份> <星期> <年代>)
```

对应于下表：

|  字段         |  值            | 通配符         |
| ------------- |:--------------:|:-------------:|
| 分钟          | 0-59           | , - * /       |
| 小时           | 0-23           | , - * /       |
| 日期           | 1-31           | , - * ? / L W |
| 月             | 1-12 or JAN-DEC| , - * /       |
| 星期几         | 1-7 or SUN-SAT | , - * ? / L # |
| 年代           | 1970-2199      | , - * /       |


更详细的信息，可以阅读官方的文档：[规则的计划表达式](http://docs.aws.amazon.com/zh_cn/AmazonCloudWatch/latest/events/ScheduledEvents.html)。

于是，上面的表达式，每星期一到星期五（MON-FRI），每 2 分钟运行一次。

部署
---

接下来，让我们部署代码试试：

```
$ serverless deploy
```

相应的部署过程日志如下：

```
...............
Serverless: Stack update finished...
Service Information
service: scheduled-cron
stage: dev
region: us-east-1
stack: scheduled-cron-dev
api keys:
  None
endpoints:
  None
functions:
  cron: scheduled-cron-dev-cron
  secondCron: scheduled-cron-dev-secondCron
```

然后，让我们看看日志：

```
$ serverless logs -f  cron -t
```

对应的日志如下：


```
2017-11-01 16:41:14.112 (+08:00)  6b33ad33-bee0-11e7-9439-23daa7bb59a8  Your cron function "scheduled-cron-dev-cron" ran at Wed Nov 01 2017 08:41:14 GMT+0000 (UTC)
END RequestId: 6b33ad33-bee0-11e7-9439-23daa7bb59a8
REPORT RequestId: 6b33ad33-bee0-11e7-9439-23daa7bb59a8  Duration: 0.86 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB

START RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2 Version: $LATEST
2017-11-01 16:42:13.724 (+08:00)  8ea1a80f-bee0-11e7-a0c9-331175998dc2  Your cron function "scheduled-cron-dev-cron" ran at Wed Nov 01 2017 08:42:13 GMT+0000 (UTC)
END RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2
REPORT RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2  Duration: 4.08 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB
```

这表明我们的程序，正在以每分钟的状态运行着。

当我们想做一个 Serverless 的爬虫定期执行某个任务，这样做可以帮我们节省大量的成本。

末了，记得执行：

```
$ serverless remove
```

Serverless 应用开发指南： API Gateway 与 Route53 自定义域名 
===

原文链接：[Serverless 应用开发指南： API Gateway 与 Route53 自定义域名](https://www.phodal.com/blog/serverless-development-guide-api-gateway-and-route53-custom-domain/)

在测试使用 Serverless + Node-wechat 制作微信公众号后台的时候，发现微信不能直接使用 API Gateway 的 API 地址。于是，就需要使用自己的域名。

首先，在 Route 53 上注册有域名，如果没有的话，需要转到 Route 53。

然后，在后台为你的域名请求一个证书。

需要注意的是：选择的区域是 ``us-east-1``，这个 region 才能与 API Gateway 一起工作。

在这个过程中，需要验证域名的所有权。所以，你需要先找个地方注册域名邮箱，如我使用的是网易的域名邮箱。

Serveress Domain Manager
---

在这里我们要用到 serverless-domain-manager 插件：  

```
$ yarn add --dev serverless-domain-manager
```

或者

```
$ npm install serverless-domain-manager --save-dev
```

将这个插件配置好 serverless.yml 文件中：

```
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: wechat.wdsm.io
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
```

然后执行创建域名：

```
serverless create_domain
```

相应的日志如下：

```
Serverless: Domain was created, may take up to 40 mins to be initialized.
```

可以使用 AWS CLI 查看日志的创建状态：

```
$ aws apigateway get-domain-names

{
    "items": [
        {
            "certificateArn": "arn:aws:acm:us-east-1:706605665335:certificate/278c252a-7aaf-41df-bcf1-adc279347557",
            "distributionDomainName": "d1pp7oijqquj95.cloudfront.net",
            "certificateUploadDate": 1509592737,
            "domainName": "wechat.wdsm.io"
        }
    ]
}
```

然后就可以执行部署了：

```
serverless deploy
```

日志如下：

```
....................................
Serverless: Stack update finished...
Service Information
service: serverless-wechat
stage: dev
region: us-east-1
stack: serverless-wechat-dev
api keys:
  None
endpoints:
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  runserver: serverless-wechat-dev-runserver
Serverless Domain Manager Summary
Domain Name
  wechat.wdsm.io
Distribution Domain Name
  d1pp7oijqquj95.cloudfront.net
```

现在，你就可以使用自己定义的域名来访问了 API Gateway 了。

Serverless 应用开发指南：基于 Serverless 与 Lambda 的微信公共平台
===

原文链接：[Serverless 应用开发指南：基于 Serverless 与 Lambda 的微信公共平台](https://www.phodal.com/blog/serverless-development-guide-serverless-lambda-wechat-public-platform/)

Serverless 在事件驱动方面具有天然的优势，其中之一就是聊天机器人。可要做聊天机器人不是一件容易的事，微信和 QQ 都只能用 Hack 的方式进行。

于是，便想到微信公众号是不是一个更好的选择。当用户输入一个关键词时，做出相应的回复。总体上来说，他们之间是差不多的。这个时候，就可以开始尝试一个在线上运行的 Serverless 服务。

在这件事上，有这么几个步骤：

 - 创建 Serverless  服务
 - 引入 node-wechat
 - 配置 APP_ID 和 TOKEN 等 
 - 配置 Route 53 与 API Gateway
 - 添加微信公众平号服务
 - 部署

创建 Serverless  服务
---

首先，让我们创建我们的服务：

```
serverless create --template aws-nodejs --path serverless-wechat
```

这个步骤依旧是这么的简单。

引入 node-wechat
---

然后我找到了 node-wechat 库，它使用 express 来做路由，示例如下：

```
const express = require('express');
const app = express();
var wechat = require('wechat');
var config = {
  token: 'token',
  appid: 'appid',
  encodingAESKey: 'encodinAESKey',
  checkSignature: true // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

app.use(express.query());
app.use('/wechat', wechat(config, function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  if (message.FromUserName === 'diaosi') {
    // 回复屌丝(普通回复)
    res.reply('hehe');
  }
}));
```  

上面便是我们的 ``index.js`` 文件。

然后就是使用类似于《[Serverless 应用开发指南：Serverless + Express 的 React 服务端渲染](https://www.phodal.com/blog/serverless-development-guide-express-react-build-server-side-rendering/)》中的方法，使用 ``aws-serverless-express`` 来做出一层代理：

```
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./index');
const server = awsServerlessExpress.createServer(app);

exports.runserver = (event, context) => {
   console.log("EVENT: " + JSON.stringify(event));
   awsServerlessExpress.proxy(server, event, context)
}
```

接下来就是进行相关的配置。

配置 APP_ID 和 TOKEN 等 
---

首先，修改我们的 ``index.js`` 文件中的配置相关代码：

```
let config = {
  token: process.env.TOKEN,
  appid: process.env.APP_ID,
  encodingAESKey: process.env.AESKey,
  checkSignature: true
};
```

token、id、encodingAESKey 将从 ``serverless.yml`` 文件中读取。我们的 ``serverless.yml`` 文件将从另外的文件中读取：

```

functions:
  runserver:
    handler: handler.runserver
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
    environment:
      TOKEN: ${file(./config.yml):TOKEN}
      APP_ID: ${file(./config.yml):APP_ID}
      AESKey: ${file(./config.yml):AESKey}
```

即从 ``config.yml`` 中读取：

```
TOKEN: TOKEN
APP_ID: APP_ID
AESKey: AESKey
```

这是为了确保我们可以保护密钥的安全。

一切准备就绪，执行：

```
serverless deploy
```

就会生成对应的 API：

```
stack: serverless-wechat-dev
api keys:
  None
endpoints:
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  runserver: serverless-wechat-dev-runserver
```

于是，我将这个地址填到了公众号后台，发现公号不支持 API Gateway。只能想办法使用自定义的域名，随后就需要使用 Route 53 来创建了。

配置 Route 53 与 API Gateway
---

如之前在《[Serverless 应用开发指南： API Gateway 与 Route53 自定义域名](https://www.phodal.com/blog/serverless-development-guide-api-gateway-and-route53-custom-domain/)》中所说，按下面的步骤就可以配置 Route 53 了。

在 Route 53 上注册有域名，如果没有的话，需要转到 Route 53。

然后，才能为你的域名请求一个证书

需要选择的区域是 ``us-east-1``，这个 region 才能与 API Gateway 一起工作。

在这个过程中，需要验证域名的所有权。所以，你需要先找个地方注册域名邮箱，如我使用的是网易的域名邮箱。

```
$ yarn add --dev serverless-domain-manager
```

或者

```
$ npm install serverless-domain-manager --save-dev
```

```
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: wechat.wdsm.io
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
```

```
serverless create_domain
```

日志：


```
Serverless: Domain was created, may take up to 40 mins to be initialized.
```

AWS CLI 查看：

```
{
    "items": [
        {
            "certificateArn": "arn:aws:acm:us-east-1:706605665335:certificate/278c252a-7aaf-41df-bcf1-adc279347557",
            "distributionDomainName": "d1pp7oijqquj95.cloudfront.net",
            "certificateUploadDate": 1509592737,
            "domainName": "wechat.wdsm.io"
        }
    ]
}
```

现在，再执行 ``serverless deploy`` 就可以完成整个步骤了。

添加微信公众平号服务
---

然后，我们可以创建几个简单的服务，比如从 Google 搜索内容：

```
google(keyword, function (err, res) {
  let result = R.map(R.compose(updateItemField, R.values, R.pick(['title', 'link'])))(res.links);
  response.reply('你想要在 Google 上搜索的内容有： ' + result);
});
```

又或者是，搜索我博客的相关内容：

```
request.get('https://www.phodal.com/api/app/blog_detail/?search=' + keyword, {
  headers: {
    'User-Agent': 'google'
  }
}, function (error, res, body) {
  if (res.statusCode === 200) {
    let parsed = JSON.parse(body);
    const data = parsed;
    var result = R.map(R.compose(updatePhodalItemField, R.values, R.pick(['title', 'slug'])))(data);
    response.reply({
      content: '在『 phodal.com 』上有 x 个结果，前 10 个如下：' + result,
      type: 'text'
    });
  }
});
```

最后代码见：[https://github.com/phodal/mp/blob/master/index.js](https://github.com/phodal/mp/blob/master/index.js)

部署
---

最后，让我们愉快地执行 ``serverless deploy``，对应的日志如下：

```
stack: serverless-wechat-dev
api keys:
  None
endpoints:
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  runserver: serverless-wechat-dev-runserver
Serverless Domain Manager Summary
Domain Name
  wechat.wdsm.io
Distribution Domain Name
  d1pp7oijqquj95.cloudfront.net
```

结果你想用这个服务，那么只需要：

```
serverless install -u https://github.com/phodal/mp -mp
```

执行：

```
yarn install
```

再创建你的 ``config.yml`` 文件：

```
cp config.yml.template config.yml
```

最后，就可以愉快地部署了。

如果你是为测试，你可以执行 ``serverless remove`` 来删除服务。
