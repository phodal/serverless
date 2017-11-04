# Serverless Kinesis streams

Serverless service to showcase Kinesis stream support.

## Installation

Make sure that you use Serverless v1.

1. Run `serverless install --url https://github.com/pmuens/serverless-kinesis-streams` to install the service in your current working directory
2. Next up cd into the service with `cd serverless-kinesis-streams`
3. Run `npm install`
4. Create a new Kinesis stream called `data-receiver`
5. Update the stream ARN property in the `serverless.yml` file with the stream ARN of your `data-receiver` stream
6. Deploy with `serverless deploy`

## How to use

1. Run `serverless invoke --function dataReceiver --path event.json` to send data to the Kinesis stream
2. Run `serverless logs --function logger` to see the which data was send to the Kinesis `date-receiver` stream

## AWS services used

- Lambda
- Kinesis
