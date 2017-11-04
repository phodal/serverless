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

```
serverless invoke --function receiver --path event.json
```

## AWS services used

- Lambda
- Kinesis
