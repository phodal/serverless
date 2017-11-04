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



