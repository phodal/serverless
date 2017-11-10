Serverless Simulate 模拟
===

``注意``：需要先安装  Docker


安装

```
yarn add --dev serverless-plugin-simulate
```

添加到 ``serverless.yml``

```
plugins:
  - serverless-plugin-simulate


custom:
  simulate:
    services: docker-compose.yml
```

执行：

```
docker pull lambci/lambda
```

运行：

```
sls simulate apigateway -p 5000
```

