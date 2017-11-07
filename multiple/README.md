

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (640 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
....................
Serverless: Stack update finished...
Service Information
service: multiple
stage: dev
region: us-east-1
stack: multiple-dev
api keys:
  None
endpoints:
  GET - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/python
  GET - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/js
functions:
  pythonDemo: multiple-dev-pythonDemo
  jsDemo: multiple-dev-jsDemo
```

js

```
{"message":"Go Serverless v1.0! Your function executed successfully!","input":{"resource":"/js","path":"/js","httpMethod":"GET","headers":{"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8","Accept-Encoding":"gzip, deflate, br","Accept-Language":"zh-CN,zh;q=0.8,en-GB;q=0.6,en;q=0.4,it;q=0.2,zh-TW;q=0.2,ja;q=0.2","CloudFront-Forwarded-Proto":"https","CloudFront-Is-Desktop-Viewer":"true","CloudFront-Is-Mobile-Viewer":"false","CloudFront-Is-SmartTV-Viewer":"false","CloudFront-Is-Tablet-Viewer":"false","CloudFront-Viewer-Country":"HK","dnt":"1","Host":"ulgoy525y4.execute-api.us-east-1.amazonaws.com","upgrade-insecure-requests":"1","User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36","Via":"2.0 176337e603db4b8969c9bd65812887b3.cloudfront.net (CloudFront)","X-Amz-Cf-Id":"yXigkVzYxOVqEcBEyhEpJT08zsTOFIkbkOW0EzmkKRfqT3BQcz38KA==","X-Amzn-Trace-Id":"Root=1-5a01c075-49c17464393b0d18223bc3fb","X-Forwarded-For":"202.66.38.130, 54.182.170.101","X-Forwarded-Port":"443","X-Forwarded-Proto":"https"},"queryStringParameters":null,"pathParameters":null,"stageVariables":null,"requestContext":{"path":"/dev/js","accountId":"706605665335","resourceId":"5j3roq","stage":"dev","requestId":"6127f9d4-c3c6-11e7-9735-198923464ae6","identity":{"cognitoIdentityPoolId":null,"accountId":null,"cognitoIdentityId":null,"caller":null,"apiKey":"","sourceIp":"202.66.38.130","accessKey":null,"cognitoAuthenticationType":null,"cognitoAuthenticationProvider":null,"userArn":null,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36","user":null},"resourcePath":"/js","httpMethod":"GET","apiId":"ulgoy525y4"},"body":null,"isBase64Encoded":false}}
```

python 


```
{"message": "Hello, the current time is 14:17:24.453136"}
```

  