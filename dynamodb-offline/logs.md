

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



