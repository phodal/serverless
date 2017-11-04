# Serverless Firehose


> Amazon Kinesis Firehose 是将流数据加载到 AWS 的最简单方式。它可以捕捉、转换流数据并将其加载到 Amazon Kinesis Analytics、Amazon S3、Amazon Redshift 和 Amazon Elasticsearch Service，让您可以利用正在使用的现有商业智能工具和仪表板进行近乎实时的分析。这是一项完全托管的服务，可以自动扩展以匹配数据吞吐量，并且无需持续管理。它还可以在加载数据前对其进行批处理、压缩和加密，从而最大程度地减少目的地使用的存储量，同时提高安全性。



Serverless service to showcase Kinesis stream support.

based on:[serverless-kinesis-streams](https://github.com/pmuens/serverless-kinesis-streams), but auto create Kinesis streams

## Installation

1.install

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/kinesis-streams -n kinesis-streams
```

2.install

```
npm install
```

3.deploy

```
serverless deploy
```

```
serverless invoke --function receiver --path event.json
```

## AWS services used

- Lambda
- Kinesis
