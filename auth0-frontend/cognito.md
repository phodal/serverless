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


