# Serverless Kinesis streams

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

## How to use

1. Run `serverless invoke --function dataReceiver --path event.json` to send data to the Kinesis stream
2. Run `serverless logs --function logger` to see the which data was send to the Kinesis `date-receiver` stream

## AWS services used

- Lambda
- Kinesis
