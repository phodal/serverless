Serverless 应用示例：二维码生成
===

昨天看到了一篇关于二维码使用的文章，其设计初衷是使用二维码卡片来帮助小朋友控制智能音箱。即在 Raspberry Pi 上使用摄像头来识别二维码，二维码卡片上是一些简单的操作，如播放音乐、暂停等等，卡片的另外一面则是相应的解释。这是一个有趣的二维码在物联网应用的场景。

于是乎，我便想尝试一下直接在云端生成二维码图片，并保存。当然了，对于二维码来说，直接在浏览器上生成显然是更加简单友好的。

总览
---

在这个项目里，我们的主要流程是：

1. 从 URL 中获取要生成的二维码字符串
2. 将生成的二维码图片上传到 AWS S3
3. 重定向 URL 到生成的 AWS S3 上

对，就是这么简单，实现起来也很简单。

生成应用
---

照例我们需要先安装有 ``serverless``，如果没有的话，请使用：

```
npm install -g serverless
```

然后来创建我们的应用：

```
serverless create --template aws-nodejs --path qrcode
```

愉快地进行我们的 init commmit。

配置资源
---

在这个项目里，我们所需要的 AWS 资源有：

 - AWS S3 用于存储图片
 - Route 53 用于分配路由

那么，接下来就是打开 ``serverless.yml`` 文件进行配置。

```
resources:
  Resources:
    PackageStorage:
      Type: AWS::S3::Bucket
      Properties:
        AccessControl: PublicRead
        BucketName: ${self:custom.qrcodeBucket}
        LifecycleConfiguration:
          Rules:
            - ExpirationInDays: 1
              Status: Enabled
```

以及配置，相应的权限：

```
provider:
  name: aws
  runtime: nodejs6.10
  iamRoleStatements:
    - Effect: "Allow"
      Action:
        - "s3:ListBucket"
        - "s3:PutObject"
        - "s3:PutObjectAcl"
      Resource:
        - "arn:aws:s3:::${self:custom.qrcodeBucket}"
        - "arn:aws:s3:::${self:custom.qrcodeBucket}/*"
```

还有 Route 53 中的域名：

```
plugins:
  - serverless-domain-manager

custom:
  # change this, so it's unique for your setup
  qrcodeBucket: ${self:service}.${self:provider.stage,opt:stage}
  stageVariables:
    bucketName: ${self:custom.qrcodeBucket}
  customDomain:
    domainName: qrcode.pho.im
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
```

接下来，就可以愉快地写代码了。

生成二维码
---

为了生成二维码，我找到了项目：[node-qrcode](https://github.com/soldair/node-qrcode)，然后安装之：

```
yarn add qrcode
```

试了试 DEMO：

```
QRCode.toFile('path/to/filename.png', 'Some text', {
  color: {
    dark: '#00F',  // Blue dots
    light: '#0000' // Transparent background
  }
}, function (err) {
  if (err) throw err
  console.log('done')
})
```

不对，这样好像有问题：


```
  QRCode.toDataURL(string, {
    errorCorrectionLevel: 'H'
  }, function (err, url) {

  }
```

在尝试了多次之后，我手动将 base64 转成了 png：

```
new Buffer(url.replace(/^data:image\/\w+;base64,/, ""), 'base64')
```

随后，就可以上传图片了 AWS S3 上。

上传 AWS S3
---

只需要配置好相应的权限和 Key、Bucket，然后使用 ContentEncoding 为 base64：

```
const params = {
  Bucket: process.env.bucketName,
  Key: key,
  ACL: 'public-read',
  Body: new Buffer(url.replace(/^data:image\/\w+;base64,/, ""), 'base64'),
  ContentEncoding: 'base64',
  ContentType: 'image/png'
};

s3.putObject(params, function (err, data) {
  if (err) {
    return callback(new Error(`Failed to put s3 object: ${err}`));
  }

  const response = {
    statusCode: 302,
    headers: {
      location: `https://s3.amazonaws.com/${process.env.bucketName}/${key}`
    }
  };

  return callback(null, response);
})
```

将 ACL 配置为 public-read，就可以在外网访问了。

优化二维码
---

在多次测试之后，我决定优化一下上传的参数：

```
  QRCode.toDataURL(string, {
    errorCorrectionLevel: 'H',
    width: 512,
    margin: 2,
    color: {
      light: '#fdfdfd',
      dark: '#384452'
    }
  }
```  

部署及测试
---

好了，现在我们就可以部署，执行相应的部署命令：

```
$ sls deploy

Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (699.08 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...
Service Information
service: qrcode
stage: dev
region: us-east-1
stack: qrcode-dev
api keys:
  None
endpoints:
  GET - https://swsaner181.execute-api.us-east-1.amazonaws.com/dev/
functions:
  create: qrcode-dev-create
Serverless Domain Manager Summary
Domain Name
  qrcode.pho.im
Distribution Domain Name
  d1vpwj4ctk345u.cloudfront.net
Serverless: Removing old service versions...
```

然后在网页上测试，我们创建的服务地址是：https://qrcode.pho.im/?q={string}

使用这个 URL 进行测试：https://qrcode.pho.im/?q=http://weixin.qq.com/r/mnVYQHrEVicprT4j9yCI

加上使用的短链服务就是：[https://x.pho.im/Z5t7](https://x.pho.im/Z5t7)
