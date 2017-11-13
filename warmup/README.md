

添加插件：

```
npm install serverless-plugin-warmup --save-dev
```

添加到 ``serverless.yml`` 中：

```
plugins:
  - serverless-plugin-warmup
```

添加 ``warmup`` 属性：

```
functions:
  hello:
    warmup: true
```

或者：

```
functions:
  hello:
    warmup:
      - production
      - staging
```

添加 role

```

provider:
  name: aws
  runtime: nodejs6.10
  iamRoleStatements:
    - Effect: 'Allow'
      Action:
        - 'lambda:InvokeFunction'
      Resource:
      - Fn::Join:
        - ':'
        - - arn:aws:lambda
          - Ref: AWS::Region
          - Ref: AWS::AccountId
          - function:${self:service}-${opt:stage, self:provider.stage}-*
```

添加响应：

```
  /** Immediate response for WarmUP plugin */
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
```

自定义参数：

```
custom:
  warmup:
    cleanFolder: false,
    memorySize: 256
    name: 'make-them-pop'
    schedule: 'cron(0/5 8-17 ? * MON-FRI *)' // Run WarmUP every 5 minutes Mon-Fri between 8:00am and 5:55pm (UTC)
    timeout: 20
    prewarm: true // Run WarmUp immediately after a deployment
    folderName: '_warmup' // Name of the folder created for the generated warmup lambda
```

花费
---

Free Tier not included + Default WarmUP options + 10 lambdas to warm, each with memorySize = 1024 and duration = 10:

WarmUP: runs 8640 times per month = $0.18
10 warm lambdas: each invoked 8640 times per month = $14.4
Total = $14.58

CloudWatch costs are not in this example because they are very low.

