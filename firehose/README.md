# Serverless Kinesis Firehose 持久化数据到 S3

based on:[serverless-kinesis-streams](https://github.com/pmuens/serverless-kinesis-streams), but auto create Kinesis streams

在尝试了使用 Kinesis Stream 处理数据之后，我发现它并不能做什么。接着，便开始找寻其它方式，其中一个就是：Amazon Kinesis Firehose

> Amazon Kinesis Firehose 是将流数据加载到 AWS 的最简单方式。它可以捕捉、转换流数据并将其加载到 Amazon Kinesis Analytics、Amazon S3、Amazon Redshift 和 Amazon Elasticsearch Service，让您可以利用正在使用的现有商业智能工具和仪表板进行近乎实时的分析。这是一项完全托管的服务，可以自动扩展以匹配数据吞吐量，并且无需持续管理。它还可以在加载数据前对其进行批处理、压缩和加密，从而最大程度地减少目的地使用的存储量，同时提高安全性。

Serverless Kinesis Firehose 代码
---

总的来说，Kinesis Firehose 的 Lambda 代码与 Kinesis 是差不多的。

```
module.exports.receiver = (event, context, callback) => {
  const data = event.data;
  const firehose = new AWS.Firehose();

  const params = {
    Record: {
      Data: data
    },
    DeliveryStreamName: 'serverless-firehose'
  };

  return firehose.putRecord(params, (error, data) => {
    ...
};
```

以下则是 Kinesis Stream 的代码：

```
module.exports.dataReceiver = (event, context, callback) => {
  const data = event.data;
  const kinesis = new AWS.Kinesis();
  const partitionKey = uuid.v1();

  const params = {
    Data: data,
    PartitionKey: partitionKey,
    StreamName: 'kinesis-streams-stream'
  };

  return kinesis.putRecord(params, (error, data) => {
    ...
  });
};
```

两个 Lambda 函数之间，最大的区别就是在于 new 出来的对象不一样，并且这个对象的参数也是不一样的。

但是他们的配置来说，可能相差甚远。并且，实际上将数据存到 S3 的工作，主要是由 ``serverless.yml`` 文件来控制 的：

```
ServerlessKinesisFirehoseBucket:
  Type: AWS::S3::Bucket
  DeletionPolicy: Retain
  Properties:
    BucketName: serverless-firehose-bucket
ServerlessKinesisFirehose:
  Type: AWS::KinesisFirehose::DeliveryStream
  Properties:
    DeliveryStreamName: serverless-firehose
    S3DestinationConfiguration:
      BucketARN:
        Fn::Join:
        - ''
        - - 'arn:aws:s3:::'
          - Ref: ServerlessKinesisFirehoseBucket
      BufferingHints:
        IntervalInSeconds: "60"
        SizeInMBs: "1"
      CompressionFormat: "UNCOMPRESSED"
      Prefix: "raw/"
      RoleARN: { Fn::GetAtt: [ FirehoseToS3Role, Arn ] }
```          

在配置文件中，我们定义了要交付的 Stream 的名字，以及对应用来存储数据的 S3 Bucket 名称。

安装及测试
---

好了，现在不妨直接试试相关的代码。

1.安装我们的服务

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/kinesis-streams -n kinesis-streams
```

2.然后：

```
npm install
```

3.紧接着部署：

```
serverless deploy
```

4.触发我们的函数：

```
serverless invoke --function receiver --path event.json
```

便会在我们的 S3 中生成对应的数据文件：

![Firehose](./images/firehose-s3.png)

由于这里的数据太少，就没有用 Kinesis Analytics 进行分析了。

