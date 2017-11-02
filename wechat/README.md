
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