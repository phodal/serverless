Serverless 架构应用开发：使用 Serverless Simulate 插件在本地运行 Lambda
===

Serverless 应用的一个不方便之处：缺少一个本地的调试环境。在之前的那篇《[Serverless 架构应用开发：使用 serverless-offline 在本地部署与调试](https://www.phodal.com/blog/serverless-architecture-development-serverless-offline-localhost-debug-test/)》中， 我们提到了使用 ``serverless-offline`` 插件来在本地部署和调试。在本文中，我们将介绍 ``serverless-plugin-simulate`` 插件来解决相似的问题。

serverless-plugin-simulate 插件
---

``serverless-plugin-simulate`` 是一个的概念证明，用来尝试使用 docker 镜像复制 Amazon API Gateway 来运行lambda。

它可以支持以下的功能：

 - 由 docker-lambda 支持的 λ 运行时环境。
 - CORS
 - 授权
    - 自定义授权者（支持）
    - Coginito 授权（暂不支持）
 - Lambda集成
    - Velocity 模板（支持）。
 - Lambda代理集成（支持的）。 

那么，让我们来试试使用 ``serverless-plugin-simulate`` 插件来模拟 Lambda 环境。


安装 serverless-plugin-simulate 及环境 
---

``注意``：由于这里需要使用 Docker，建议读者先行安装  Docker。

然后，让我们来创建 Serverless 应用：

```
serverless create --template aws-nodejs --path simulate-lambda
```

接着，就可以安装 serverless-plugin-simulate 插件了

```
yarn add --dev serverless-plugin-simulate
```

然后，添加到 ``serverless.yml`` 中：

```
plugins:
  - serverless-plugin-simulate


custom:
  simulate:
    services: docker-compose.yml
```

上面的配置中依赖于 ``docker-compose.yml`` 文件，创建、然后输入：

```
version: '2'
```

保存，并退出。

紧接着，运行：``docker pull lambci/lambda``。

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

它将从服务端下载 lambci 的 lambda 镜像。

运行及测试
---

然后运行 simlaute

```
$ sls simulate apigateway -p 5000

Serverless: Starting mock services.
Serverless:
Serverless: [GET /undefined] => λ:hello
Serverless: Invoke URL: http://localhost:5000
Serverless: HTTP Event Not Found: Try checking your serverless.yml
```

发现少了一个入口，于是在 ``serverless.yml`` 中添加了路径

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

接着再次运行，然后访问：[http://localhost:5000/hello](http://localhost:5000/hello)

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

就可以得到类似于生产环境的 Lambda 函数的结果。
