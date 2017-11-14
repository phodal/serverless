Serverless Simulate 模拟
===

``注意``：需要先安装  Docker


安装

```
yarn add --dev serverless-plugin-simulate
```

添加到 ``serverless.yml``

```
plugins:
  - serverless-plugin-simulate


custom:
  simulate:
    services: docker-compose.yml
```

运行：

```
sls simulate apigateway -p 5000
```

```
Couldn't connect to Docker daemon - you might need to run `docker-machine start default`.
```

执行：

```
$ docker pull lambci/lambda

Using default tag: latest
latest: Pulling from lambci/lambda
5aed7bd8313c: Pull complete
d60049111ce7: Pull complete
7791f7ad5cf2: Pull complete
Digest: sha256:4d511dfc1a264ccc69081ceb00116dd0bea380080ad1e89c2f48752f6c4670df
Status: Downloaded newer image for lambci/lambda:latest
```

再次执行：

```
$ sls simulate apigateway -p 5000

Serverless: Starting mock services.
Serverless:
Serverless: [GET /undefined] => λ:hello
Serverless: Invoke URL: http://localhost:5000
Serverless: HTTP Event Not Found: Try checking your serverless.yml
```

```
$ sls simulate lambda -p 4000                                                        

Serverless: Starting mock services.
Serverless:
Serverless: Starting registry with db at /Users/fdhuang/learing/serverless-guide/simulate/.sls-simulate-registry
Serverless: Starting registry at: http://192.168.199.170:4000
```

这样一来，似乎也是不对的。

于是：

```

functions:
  hello:
    handler: handler.hello
    events:
      - http:
          method: get
          path: hello
```

中途也会有：

```
$ npm start

> simulate@1.0.0 start /Users/fdhuang/learing/serverless-guide/simulate
> sls simulate apigateway -p 5000

Serverless: Starting mock services.
Serverless:
Serverless: [GET /hello] => λ:hello
Serverless: Invoke URL: http://localhost:5000
Serverless: Creating event
Serverless: Invoking hello
Serverless: Invoking function handler.hello
START RequestId: 18b5b89b-7118-1344-7f1e-a3b49c5c26d4 Version: $LATEST
END RequestId: 18b5b89b-7118-1344-7f1e-a3b49c5c26d4
REPORT RequestId: 18b5b89b-7118-1344-7f1e-a3b49c5c26d4	Duration: 6.27 ms	Billed Duration: 100 ms	Memory Size: 1024 MB	Max Memory Used: 28 MB

{"statusCode":200,"body":"{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":{\"path\":\"/hello\",\"headers\":{\"host\":\"localhost:5000\",\"connection\":\"keep-alive\",\"cache-control\":\"max-age=0\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36\",\"upgrade-insecure-requests\":\"1\",\"accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\",\"dnt\":\"1\",\"accept-encoding\":\"gzip, deflate, br\",\"accept-language\":\"zh-CN,zh;q=0.8,en-GB;q=0.6,en;q=0.4,it;q=0.2,zh-TW;q=0.2,ja;q=0.2\",\"cookie\":\"mezzanine-rating=\\\"\\\\054blog.blogpost.20\\\\054blog.blogpost.13\\\\054blog.blogpost.5\\\\054blog.blogpost.19\\\\054blog.blogpost.21\\\\054blog.blogpost.9\\\"; csrftoken=A9i99HpofF4q19ehVQY4D8w0cRwddlnSwbz4DUQV0yqax3cufTN8Np5gzldqkotH; _ga=GA1.1.427084651.1503497781\",\"if-none-match\":\"W/\\\"6a9-Sps0n/Pmo7hiZsErZVJqVbiAPPk\\\"\"},\"pathParameters\":{},\"requestContext\":{\"accountId\":\"localContext_accountId\",\"resourceId\":\"localContext_resourceId\",\"stage\":\"dev\",\"requestId\":\"localContext_requestId_30305881537279267\",\"identity\":{\"cognitoIdentityPoolId\":\"localContext_cognitoIdentityPoolId\",\"accountId\":\"localContext_accountId\",\"cognitoIdentityId\":\"localContext_cognitoIdentityId\",\"caller\":\"localContext_caller\",\"apiKey\":\"localContext_apiKey\",\"sourceIp\":\"::ffff:127.0.0.1\",\"cognitoAuthenticationType\":\"localContext_cognitoAuthenticationType\",\"cognitoAuthenticationProvider\":\"localContext_cognitoAuthenticationProvider\",\"userArn\":\"localContext_userArn\",\"userAgent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36\",\"user\":\"localContext_user\"}},\"resource\":\"localContext_resource\",\"httpMethod\":\"GET\",\"queryStringParameters\":{},\"body\":\"{}\",\"stageVariables\":{}}}"}
Serverless: Mapping response
GET /hello 200 1518.527 ms - 1802
Serverless: HTTP Event Not Found: Try checking your serverless.yml
GET /favicon.ico 403 1.084 ms - 23
HTTP Event Not Found: Try checking your serverless.yml
```
