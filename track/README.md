# Serverless OwnTracks HTTP Backend
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

This is a implementation of the [OwnTracks](http://owntracks.org/)
[HTTP](http://owntracks.org/booklet/tech/http/) backend on 
[AWS Lambda](https://aws.amazon.com/lambda/) using
[serverless](http://serverless.com).

It currently implements:
 * saving locations to [DynamoDB](https://aws.amazon.com/dynamodb/)
 * a per-tid GeoJSON endpoint with points
 * a per-tid GeoJSON endpoint with a linestring

There's no UI, but you can use https://github.com/dschep/geojson-viewer to
visualize the GeoJSON endpoints.

## Quickstart
```
# edit serverless.yml to set env vars
npm install
sls deploy
```

Guide
===

```
serverless install -u https://github.com/dschep/owntracks-serverless -n track
```

```
yarn install
```

``serverless deploy``

```
.................................................................................
Serverless: Stack update finished...
Serverless: Invoke aws:info
Service Information
service: track
stage: dev
region: us-east-1
stack: track-dev
api keys:
  None
endpoints:
  POST - https://f0gdpz1lce.execute-api.us-east-1.amazonaws.com/dev/pub
  GET - https://f0gdpz1lce.execute-api.us-east-1.amazonaws.com/dev/{tid}/geojson/points
  GET - https://f0gdpz1lce.execute-api.us-east-1.amazonaws.com/dev/{tid}/geojson/linestring
functions:
  pub: track-dev-pub
  geojson-points: track-dev-geojson-points
  geojson-linestring: track-dev-geojson-linestring
Serverless: Invoke aws:deploy:finalize
```

POST 数据

```
curl -X POST https://f0gdpz1lce.execute-api.us-east-1.amazonaws.com/dev/pub -d "@event.json"
```

日志：

```
START RequestId: 0c2e5b34-c05f-11e7-bd55-c77d7c9072f8 Version: $LATEST
END RequestId: 0c2e5b34-c05f-11e7-bd55-c77d7c9072f8
REPORT RequestId: 0c2e5b34-c05f-11e7-bd55-c77d7c9072f8	Duration: 98.40 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 40 MB
```

看不到有用的内容：

