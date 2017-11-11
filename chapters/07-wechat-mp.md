Serverless 的微信公共平台
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

最后效果见我的微信公众号：phodal-weixin

![微信](images/phodal-wechat.jpg)
