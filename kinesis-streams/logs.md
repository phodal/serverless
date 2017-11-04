Serverless 应用开发指南：基于 Kinesis Streams 的数据流分析（上） 
===

Serverless 适合用于事件驱动型应用，以及定时任务。今天，让我们来看看一个事件驱动的例子。

在之前的那篇《[Serverless 应用开发指南：CRON 定时执行 Lambda 任务](https://www.phodal.com/blog/serverless-development-guide-cron-scheduled-job/)》中，我们介绍了如何调度的示例。

最初我想的是通过 Lambda + DynamoDB 来自定义数据格式，后来发现使用 Kinesis Streams 是一种更简单的方案。

Amazon Kinesis Streams
---

今天，我们要学习的组件是 Amazon Kinesis Streams。引自官网的介绍：

> 借助 Amazon Kinesis Streams，您可以构建用于处理或分析流数据的自定义应用程序，以满足特定需求。Kinesis Streams 每小时可从数十万种来源 (如网站点击流、财务交易、社交媒体源、IT 日志和定位追踪事件) 中持续捕获和存储数 TB 数据。借助 Kinesis Client Library (KCL)，您可以构建 Amazon Kinesis 应用程序，并能使用流数据为实时控制面板提供强力支持、生成警报、实施动态定价和广告等等。您还可以将数据从 Kinesis Streams 发送到其他 AWS 服务中，如 Amazon Simple Storage Service (Amazon S3)、Amazon Redshift、Amazon EMR 和 AWS Lambda。

简单的来说，用于收集日志事件数据的功能，还可以用于实时数据分析。

Serverless + Kinesis Streams
---

最初我试用了 GitHub 上的[serverless-kinesis-streams](https://github.com/pmuens/serverless-kinesis-streams)，然后发现它并不会自动创建 Kinesis Streams 服务，于是便自己创建了一个：

```
serverless install -u https://github.com/phodal/serverless-guide/tree/master/kinesis-streams -n kinesis-streams                                10:14:50
Serverless: Downloading and installing "serverless-kinesis-streams"...
central entry: serverless-kinesis-streams-master/
central entry: serverless-kinesis-streams-master/README.md
central entry: serverless-kinesis-streams-master/event.json
central entry: serverless-kinesis-streams-master/handler.js
central entry: serverless-kinesis-streams-master/package.json
central entry: serverless-kinesis-streams-master/serverless.yml
Serverless: Successfully installed "serverless-kinesis-streams" as "kinesis-streams"
```

然后执行：

```
yarn install
```

就可以直接部署了：

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (19.75 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............................
Serverless: Stack update finished...
Service Information
service: kinesis-streams
stage: dev
region: us-east-1
stack: kinesis-streams-dev
api keys:
  None
endpoints:
  None
functions:
  dataReceiver: kinesis-streams-dev-dataReceiver
  logger: kinesis-streams-dev-logger
Serverless: Removing old service versions...
```

完成后，就可以测试一下了。

```
$ serverless invoke --function dataReceiver --path event.json                                                                

11:30:48
{
    "message": "Data successfully written to Kinesis stream \"data-receiver\""
}
```

然后，通过相应的日志，我们就可以看到数据流向了：Kinesis stream 

```
$ serverless logs --function logger                                                                                          

11:31:41
START RequestId: 3776bac6-612f-45dd-a8ac-156007f8e49b Version: $LATEST
2017-11-04 11:30:53.382 (+08:00)	3776bac6-612f-45dd-a8ac-156007f8e49b	The following data was written to the Kinesis stream "data-receiver":
{
  "kinesisSchemaVersion": "1.0",
  "partitionKey": "8e35d6a0-c110-11e7-90ae-59fa1aa30da7",
  "sequenceNumber": "49578559262872379484471662829472308063624661238972153858",
  "data": "U29tZSBleGFtcGxlIGRhdGE=",
  "approximateArrivalTimestamp": 1509766251.753
}
END RequestId: 3776bac6-612f-45dd-a8ac-156007f8e49b
REPORT RequestId: 3776bac6-612f-45dd-a8ac-156007f8e49b	Duration: 72.07 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 33 MB
```

但是光把数据流向 Kinesis stream ，并没有什么用，我们需要对数据进行处理。比如说，直接将数据存储到 S3，或者是 DynamoDB。

So，请期待我们的下一篇文章。
