Serverless 应用示例：前端错误日志及事件收集系统
===

最近在交接项目，也因此有了一些时间。之前想过做一个前端的错误日志系统，便想着直接用 Serverlss 做了好了。

开始之前先让我简单地介绍一下：[https://github.com/phodal/molog](https://github.com/phodal/molog)，以便于了解我们的需求及功能。

Molog 使用
---

先让我们看看最后要怎么用，在网页上引入：

```
<script data-component="homepage" data-env="dev" src="//static.pho.im/molog.min.js"></script>
```

顾名思义，其中的 component 针对的不是不同组件的名字，而 env 便是具体的环境。

前端的代码是基于 sherlog.js，因此在事件上也是差不多的：

```
Molog.push({field: 'xxx', action:' '}, function() { })
```

Serverless 错误收集系统架构设计
---

在之前的文章中，我们讨论过错误日志收集是一个很好的 Serverless 应用使用场景。

### 架构设计

事实上，这样的系统很简单：

![系统架构图](images/molog-architecture.png)

1.**前端通过 window.onerror 来捕获错误日志**

```
window.onerror = function(message, source, lineno, colno, error) {
 ... 
}
```

2. **然后将错误日志发给 AWS Lambda 来处理**

3. **AWS Lambda 将数据存储到 AWS DynamoDB 数据库里**

4. **当用户打开后台时，从 AWS DynamoDB 获取相应的数据**

5. **前端的静态文件，通过 S3 + Cloudfront 作为 CDN 来分发前端资源**

Molog 系统实现
---

### 1. 存储日志和事件

要在 AWS 上实际这样的系统，就便得很简单了。我们只需要存储一下这些数据即可，相关的存储逻辑如下所示：

```
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      data: JSON.stringify(event.queryStringParameters),
      env: env,
      component: component,
      createdAt: timestamp
    },
  };
```

这里的 ``env`` 和 ``component`` 是在 script 标签中遍历解析出来的：

```
env: function() {
  var s = doc.getElementsByTagName('script')
    , env;
  for( var i = 0, l = s.length; i < l; i++) {
    if (s[i].src.indexOf('molog') > -1) {
      env = s[i].getAttribute('data-env');
      break;
    }
  }
  this.env = env || '';
}
```

然后，再将这个 URL 放置到 POST 的 URL 中，即 ``serverless.yml`` 的配置文件中：

```

functions:
  create:
    handler: create/index.handler
    events:
      - http:
          path: /{component}/{env}/
          method: get
          cors: true
```

从 URL 中获取这些相关的参数

### 2. 读取日志

有了上面的基础，有读取日志也很简单，首先配置好 URL：

```
  list:
    handler: list/index.list
    events:
      - http:
          path: /{component}/{env}/logs
          method: get
          cors: true
```

然后从数据库中获取这些结果：

```
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    FilterExpression: 'env = :env and component = :component',
    ExpressionAttributeValues: {
      ':env': env,
      ':component': component,
    }
  };
  dynamoDb.scan(params, (error, result) => {

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
      },
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
```

这样就可以得到相关的日志了。

问题
---

就这么简单，发现由于  CloudFront 在国内有点水土不服，并且提供压缩的功能，导致加载速度有点慢。
