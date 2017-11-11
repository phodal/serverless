使用自定义域名
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
