Serverless 应用示例：二维码生成
===

配置资源
---

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

相应的权限：

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

以及最后的使用的域名：

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

生成二维码
---

找到了项目：[node-qrcode](https://github.com/soldair/node-qrcode)，然后安装之：

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

再手动将 base64 转成了 png：

```
new Buffer(url.replace(/^data:image\/\w+;base64,/, ""), 'base64')
```

上传 AWS S3
---

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

优化二维码
---

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

DEMO
---

创建的 URL 路由是：https://qrcode.pho.im/?q={string}

只需要：https://qrcode.pho.im/?q=http://weixin.qq.com/r/mnVYQHrEVicprT4j9yCI

加上使用的短链服务就是：[https://x.pho.im/Z5t7](https://x.pho.im/Z5t7)
