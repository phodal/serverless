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
