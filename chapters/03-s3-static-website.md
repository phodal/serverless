使用 S3 部署静态网站
===

原文链接：[Serverless 应用开发指南：使用 S3 部署静态网站](https://www.phodal.com/blog/serverless-development-guide-use-serverless-finch-deploy-s3-static-html/)

在尝试了使用 Router53 路由到 S3 后，并想试试能否使用 serverless 框架来上传静态内容。在探索官方的 DEMO 后，找到了一个 ``serverless-finch`` 插件可以做相应的事情。

```
serverless create --template aws-nodejs s3-static-file s3-static-file
```

配置 serverless-finch
---

官网的 ``serverless-client-s3`` 已经停止维护了，并推荐使用 ``serverless-finch``。

``serverless-finch`` 的安装方式是：

```
npm install --save serverless-finch
```

默认的官网生成的项目，并没有 ``package.json`` 文件，需要手动执行 ``npm inti``，再安装插件。

因此修改完后的 ``package.json`` 文件如下所示：

```
{
  "name": "s3-static-file",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Phodal Huang",
  "license": "MIT",
  "dependencies": {
    "serverless-finch": "^1.1.1"
  }
}
```

在这个时候，我们需要按 serverless 框架的插件要求，添加如下的内容：

```
plugins:
  - serverless-finch
```

并配置好我们的 S3 存储桶的名字，最后 ``serverless.yml`` 文件的内容如下所示：

```
service: s3-static-file


plugins:
  - serverless-finch

provider:
  name: aws
  runtime: nodejs6.10

custom:
  client:
    bucketName: wdsm.io
```

我们配置的 S3 存储桶的名字是: **wdsm.io**，然后其使用 ``client/dist`` 文件来放置静态文件。

静态内容
---

如我们的 ``index.html`` 文件的路径是： ``client/dist/index.html``，对应的内容是：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WDSM.io</title>
</head>
<body>
 	<h1>WDSM</h1>
</body>
</html>
```

最后，执行 ``serverless client deploy`` 就可以部署我们的网站。

``再次提醒``，这次我们用的是 ``serverless client deploy``。

相应的过程日志如下所示：

```
Serverless: Deploying client to stage "dev" in region "us-east-1"...
Serverless: Bucket wdsm.io exists
Serverless: Listing objects in bucket wdsm.io...
Serverless: Deleting all objects from bucket wdsm.io...
Serverless: Configuring website bucket wdsm.io...
Serverless: Configuring policy for bucket wdsm.io...
Serverless: Configuring CORS policy for bucket wdsm.io...
Serverless: Uploading file error.html to bucket wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/wdsm.io/error.html
Serverless: Uploading file index.html to bucket wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/wdsm.io/index.html
```

由于配置了 Router53 指向了 S3，因此可以直接访问：[http://wdsm.io/](http://wdsm.io/) 来看最后的内容。

并且，对应的删除命令也变成了：``serverless client remove``。


