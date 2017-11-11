多个语言运行环境
===

Serverless 与微服务在一点上很吸引人，你可以采用不同的语言来运行你的代码，不同的服务之间可以使用不同的语言。除了，在不同的 Serverless 服务里，采用不同的语言来开发。我们也可以在一个 Serverless 服务里，使用不同的语言来开发服务。

Serverless 多个语言运行环境
---

这次我们要创建的 Serverless 服务，其实现步骤相当的简单：

 - 使用 serverless 命令行工具，创建一个 node.js 模板
 - 在上一步的基础上添加一个 python 的服务。

于是，先让我们创建一个 hello, world 模板：

```
serverless create --template aws-nodejs --path multiple
```

然后，让我们创建一个 py-handler.py 的函数，代码如下所示：

```
import json
import datetime


def endpoint(event, context):
    current_time = datetime.datetime.now().time()
    body = {
        "message": "Hello, the current time is " + str(current_time)
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response
```

这个函数做了一件事，便是：获取当前的时间，然后导出并返回 json。

对应的，我们的 ``serverless.yml`` 文件也只是设置了不同的 runtime：

```
functions:
  pythonDemo:
    runtime: python2.7
    events:
      - http:
          method: get
          path: python
    handler: py-handler.endpoint
  jsDemo:
    runtime: nodejs6.10
    events:
      - http:
          method: get
          path: js
    handler: js-handler.hello
```

在 Python 函数部分，我们使用了 python2.7 来执行相应的代码。而在 JavaScript 部分则是 Node.js 6.10。

部署及测试
---

如果你还没有下载代码，那么先安装服务：

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/multiple -n multiple
```

然后就愉快地部署吧：

```
$ serverless deploy

Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (640 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
....................
Serverless: Stack update finished...
Service Information
service: multiple
stage: dev
region: us-east-1
stack: multiple-dev
api keys:
  None
endpoints:
  GET - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/python
  GET - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/js
functions:
  pythonDemo: multiple-dev-pythonDemo
  jsDemo: multiple-dev-jsDemo
```

针对于 js 和 python 分别有两个对应的 HTTP 结点：

 - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/python
 - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/js

访问对应的接口，就会返回对应的值，如下是 JS 返回的结果：

```
{"message":"Go Serverless v1.0! Your function executed successfully!"}
```

如下是 Python 函数返回的结果：


```
{"message": "Hello, the current time is 14:17:24.453136"}
```

当我们可以在一个服务里，写上不同的语言，就意味着：我们可以轻松地写上几十行的服务，然后轻松地部署。

对了，测试完了，记得执行 ``serverless remove``。
