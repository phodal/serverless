步骤
---



创建 Congnito
---

登录 AWS 后台，进入 Congnito 控制台。

> 您没有用户池。 单击此处创建用户池。

点击 "创建用户池"

1. 输入用户池名称，如我的是 serverless-auth
2. 为了更快的进入下一步，我点击『查看默认值』，就默认使用相关的配置
3. 接着，点击『创建池』，就可以创建一个用户池。
4. 点击左侧菜单栏的『应用程序集成』 -> 『域名』，可以设置自己的 Cognito 域名，如我的是: [https://phodal.auth.us-east-1.amazoncognito.com](https://phodal.auth.us-east-1.amazoncognito.com)

![Cognito 联合身份界面](cognito-admin.png)

然后，创建一个用户，我们将用这个账户进行测试。

创建『联合身份』
---

官方文档：[开始使用 Amazon Cognito 联合身份](http://docs.aws.amazon.com/zh_cn/cognito/latest/developerguide/getting-started-with-identity-pools.html)

登录 Amazon Cognito 控制台，选择 Manage Federated Identities，然后选择 Create new identity pool。

键入您的身份池的名称，选择 Enable access to unauthenticated identities。

如果需要，请在 Authentication providers 部分中配置身份验证提供商。有关更多信息，请参阅下面的 整合身份提供商。

选择 Create Pool。

选择 Allow 以创建两个与您的身份池关联的默认角色，一个用于未经身份验证的用户，另一个用于经过身份验证的用户。

代码
---

### Auth0 代码

```
lock.show((err, profile, token) => {
    if (err) {
      // Error callback
      console.error('Something went wrong: ', err);
      alert('Something went wrong, check the Console errors'); // eslint-disable-line no-alert
    } else {
      // Success calback
      console.log(token);

      // Save the JWT token.
      localStorage.setItem('userToken', token);

      // Save the profile
      localStorage.setItem('profile', JSON.stringify(profile));

      document.getElementById('btn-login').style.display = 'none';
      document.getElementById('btn-logout').style.display = 'flex';
      document.getElementById('nick').textContent = profile.nickname;
    }
  });
```  

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

Homepage URL:	https://phodal.auth0.com

Authorization callback URL	https://phodal.auth0.com/login/callback

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

