Serverless 架构应用开发：使用 warmup 插件保活，避免应用冷启动
===

我们采用的 Serverless 底层的技术是 Lambda 计算。Lambda 计算是在调用时才运行，我们的程序不是时刻在后台运行的，当我们的 HTTP API 请求到了 API Gateway 的时候，才会开始调用我们的 Lambda 函数。这个时候，我们的应用程序才正式开发运行。从启动到运行的这段时间，就是 Lambda 函数的冷启动时间。

据今年初 [New Relic](https://blog.newrelic.com/2017/01/11/aws-lambda-cold-start-optimization/) 的统计数据表明，Lambda 函数的冷启动时间，在 50ms~200ms 之间——幸运的是，大多部分都是在 50ms 内。

除了，我们之前提到的使用[CRON 定时执行 Lambda 任务](https://www.phodal.com/blog/serverless-development-guide-cron-scheduled-job/)。我们还就可以试 serverless-plugin-warmup 插件。

使用 serverless-plugin-warmup 保持唤醒
---

首先，让我们添加 ``serverless-plugin-warmup`` 插件：

```
npm install serverless-plugin-warmup --save-dev
```

然后，将插件添加到 ``serverless.yml`` 中：

```
plugins:
  - serverless-plugin-warmup
```

接着添加对应的 ``warmup`` 属性：

```
functions:
  hello:
    warmup: true
```

也可以设置成只在生产环境运行：

```
functions:
  hello:
    warmup:
      - production
      - staging
```

添加对应的 role 和权限

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

接着，在我们的响应里添加一个处理函数：

```
  /** Immediate response for WarmUP plugin */
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
```

步骤上可能有些麻烦，现在也差不多了。


部署及测试
---

下面就可以部署了：

```
$ serverless deploy

..............................
Serverless: Stack update finished...
Service Information
service: warmup
stage: dev
region: us-east-1
stack: warmup-dev
api keys:
  None
endpoints:
  None
functions:
  hello: warmup-dev-hello
  warmUpPlugin: warmup-dev-warmUpPlugin
```

等个十几分钟，就可以看到日志：

```
START RequestId: 94e89a8f-c820-11e7-bc6a-d3e2ee9afad9 Version: $LATEST
2017-11-13 11:13:12.382 (+08:00)  94e89a8f-c820-11e7-bc6a-d3e2ee9afad9  WarmUP - Lambda is warm!
END RequestId: 94e89a8f-c820-11e7-bc6a-d3e2ee9afad9
REPORT RequestId: 94e89a8f-c820-11e7-bc6a-d3e2ee9afad9  Duration: 3.14 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB

START RequestId: 468dbf48-c821-11e7-9753-29196147d2a5 Version: $LATEST
2017-11-13 11:18:10.224 (+08:00)  468dbf48-c821-11e7-9753-29196147d2a5  WarmUP - Lambda is warm!
END RequestId: 468dbf48-c821-11e7-9753-29196147d2a5
REPORT RequestId: 468dbf48-c821-11e7-9753-29196147d2a5  Duration: 0.80 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB
```

这个时候，我们的应用程序一直在运行，因此我们需要考虑的一个问题是：费用。该插件在官方上，帮我们算了一下钱：

> WarmUP: runs 8640 times per month = $0.18
10 warm lambdas: each invoked 8640 times per month = $14.4
Total = $14.58 

一个唤醒函数，一个月才 0.18 刀，想想觉得还是可以的。

当然，它还可以自定义参数：

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

结论
---

有了这个插件，我们就可以在用户活跃的时间里，如白天，让 Lambda 函数保活。在用户不活跃的时间里，我们就可以连这点钱也省下。
