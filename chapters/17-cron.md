
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
