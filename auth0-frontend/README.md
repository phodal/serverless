Serverless 应用开发指南：基于 Auth0 授权的 Serverless 应用
===

在多次尝试了使用 Amazon Cognito 前端授权无果，我转而使用和其它教程类似的 Auth0 授权登录。虽然 Amazon 提供了一个用于 Cognito 授权的前端组件，但是它仍然不是很成熟。在浏览器端，好像用得不是很普遍，而 Auth0 则是一个更通用的方案。

> Auth0 是一家“身份验证即服务”提供商，旨在为开发人员提供简单易用的身份管理服务。为了保持灵活性和可扩展性，Auth0 身份管理平台允许开发人员在身份验证和授权管道中增加自定义代码。

最后的代码见：[auth0-frontend](https://github.com/phodal/serverless-guide/tree/master/auth0-frontend)

代码的执行逻辑如下所示：

 - 由前端使用 Auth0 的 lock.js 调出授权框，进行用户授权
 - 用户可以选择使用第三方授权服务登录，如 Google、GitHub
 - 用户登录完后，会获取一个 Auth0 的 Token，通过该 Token 去请求数据
 - 后台接到数据后，先验证 Token 是否有效的，然后返回相应的结果

因此，对于我们而言，我们需要做这么一些事：

 - 创建一个 Serverless 服务
 - 创建一个验证 Token 的 Lambda 函数 
 - 注册 Auth0 账户
 - 绑定 Auth0 的 GitHub 授权

这里我们采用的是 Serverless Framework 的官方示例 Demo。稍有不同的是，代码中对静态文件和 S3 部分进行了一些优化——官方的 DEMO，无法直接部署到 S3 上。

Serverless Auth0 前端代码
---

在这次的教程里，代码分为两部分：前端和后台。

这里的前端代码，是一个纯前端的代码。

先让我们看看授权部分：

```
const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN);

...

lock.show((err, profile, token) => {
    if (err) {
      console.error('Something went wrong: ', err);
    } else {
      localStorage.setItem('userToken', token);
      localStorage.setItem('profile', JSON.stringify(profile));
      ...
    }
  });
```  

首先，我们创建了一个 Auth0Lock 对象，并在参数中转入了对应的 ID 和 Auth0 域名。然后使用 lock.show 方法将调出 Auth0 的登录页面，当用户登录成功的时候，就会从后台取到 token 和 profile，然后我们在上面的代码中保存用户的 token 和 profile 到 localstorage 中。

然后在发送 fetch 请求的时候，我们会带上这个 Token：

```
const token = localStorage.getItem('userToken');
if (!token) {
  return false;
}
const getdata = fetch(PRIVATE_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
  method: 'GET',
  cache: 'no-store',
});

getdata.then((response) => {
  response.json().then((data) => {
    console.log('Token:', data);
  });
});
```

主要的前端逻辑代码就是这么简单。

Serverless Auth0 后台代码
---

首先，先让我们看一眼 serverless.yml 配置。

### serverless.yml 配置

```
functions:
  auth:
    handler: handler.auth
    environment:
      AUTH0_ID: ${file(./config.yml):AUTH0_ID}
      AUTH0_SECRET: ${file(./config.yml):AUTH0_SECRET}

  publicEndpoint:
    handler: handler.publicEndpoint
    events:
      - http:
          path: api/public
          method: get
          integration: lambda
          cors: true
  privateEndpoint:
    handler: handler.privateEndpoint
    events:
      - http:
          path: api/private
          method: get
          integration: lambda
          authorizer: auth # See custom authorizer docs here: http://bit.ly/2gXw9pO
          cors:
            origins:
              - '*'
            headers:
              - Content-Type
              - X-Amz-Date
              - Authorization
              - X-Api-Key
              - X-Amz-Security-Token
```

配置中定义了三个 lambda 函数：

 - auth，用于对用户传过来的 Token 进行校验
 - publicEndpoint，一个公开的 API 结点
 - privateEndpoint，一个需授权才能访问的 API

[使用 API Gateway 自定义授权方](http://docs.aws.amazon.com/zh_cn/apigateway/latest/developerguide/use-custom-authorizer.html)

### Auth0 代码


配置
---

修改 ``config.yml``，添加 auth0 的 id 和密钥。

然后执行部署：

···

```
........................................................................
Serverless: Stack update finished...
Service Information
service: auth0-frontend
stage: dev
region: us-east-1
stack: auth0-frontend-dev
api keys:
  None
endpoints:
  GET - https://fy0qtq1r8c.execute-api.us-east-1.amazonaws.com/dev/api/public
  GET - https://fy0qtq1r8c.execute-api.us-east-1.amazonaws.com/dev/api/private
functions:
  auth: auth0-frontend-dev-auth
  publicEndpoint: auth0-frontend-dev-publicEndpoint
  privateEndpoint: auth0-frontend-dev-privateEndpoint
```

将生成的 API Gateway 的地方放入到 **client/dist/app.js** 文件中：

再执行：

```
$ serverless client deploy
```
以部署我们的静态文件。

```
Serverless: Deploying client to stage "dev" in region "us-east-1"...
Serverless: Creating bucket auth.wdsm.io...
Serverless: Configuring website bucket auth.wdsm.io...
Serverless: Configuring policy for bucket auth.wdsm.io...
Serverless: Configuring CORS policy for bucket auth.wdsm.io...
Serverless: Uploading file app.css to bucket auth.wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/auth.wdsm.io/app.css
Serverless: Uploading file app.js to bucket auth.wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/auth.wdsm.io/app.js
Serverless: Uploading file index.html to bucket auth.wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/auth.wdsm.io/index.html
```

然后打开 [https://s3.amazonaws.com/auth.wdsm.io/index.html](https://s3.amazonaws.com/auth.wdsm.io/index.html) 就可以尝试授权。

不过，在那之间，我们需要填写对应平台的授权信息：

![](./images/auth0-github-example.png)

接着，点击上面的 GitHub 『！』号，会提示我们填写对应的授权信息。

打开我们的 GitHub ，申请一个新的 OAuth 应用，地址：[https://github.com/settings/applications/new](https://github.com/settings/applications/new)

详细的信息见：[https://auth0.com/docs/github-clientid](https://auth0.com/docs/github-clientid)。

如我的配置是：

Homepage URL: https://phodal.auth0.com

Authorization callback URL  https://phodal.auth0.com/login/callback

完成后，把生成的 GitHub ID 和 Client Secret 填入。点击 Save，Auth0 就会自动帮我们测试。

接着，再到我们的页面上尝试使用 GitHub 登录，还是报了个错：

```
app.js:26 Something went wrong:  Error: error: invalid origin: https://s3.amazonaws.com
    at new LoginError (lock-9.0.min.js:9)
    at lock-9.0.min.js:9
    at onMessage (lock-9.0.min.js:10)
```

漏掉了在 Auth0 的设置页的 `Allowed Callback URL` 和 `Allowed Origins` 上加上用于登录的地址，用于允许跨域请求了。在这里，我的地址是：

```
https://s3.amazonaws.com/auth.wdsm.io/index.html
```

![CORS 配置](./images/auth0-cors-configure-example.png)

然后，再测试一下登录：

![Auth0 测试登录](./images/auth0-login-ui-example.png)

清理
---

 - 删除 Auth0 的应用
 - 删除 GitHub 的应用
 - 清空 Bucket：``serverless client remove``
 - 清空 Lambda：``serverless remove``
