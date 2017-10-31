

安装：


```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-github-webhook-listener -n github-webhook
```

项目：

```
https://github.com/phodal/serverless-guide/settings/hooks
```

替换 serverless.yml 文件中的``REPLACE-WITH-YOUR-SECRET-HERE``:

```
provider:
  name: aws
  runtime: nodejs4.3
  environment:
    GITHUB_WEBHOOK_SECRET: fsalfkjaldfjalfjalf
```

然后执行部署：

```
serverless deploy
```

```
.................................
Serverless: Stack update finished...
Serverless: Invoke aws:info
Service Information
service: github-webhook
stage: dev
region: us-east-1
stack: github-webhook-dev
api keys:
  None
endpoints:
  POST - https://kx2zlcnt51.execute-api.us-east-1.amazonaws.com/dev/webhook
functions:
  githubWebhookListener: github-webhook-dev-githubWebhookListener
Serverless: Invoke aws:deploy:finalize
```

再将密钥和 API 地址填入 GitHub 后台里。

![添加 webhook](webhook.png)


可以勾上 push 等事件用来测试。

```
serverless logs -f githubWebhookListener -t
```

原理
---

如官方提供的工作原理是：


```
┌───────────────┐               ┌───────────┐
│               │               │           │
│  Github repo  │               │   Github  │
│   activity    │────Trigger───▶│  Webhook  │
│               │               │           │
└───────────────┘               └───────────┘
                                      │
                     ┌────POST────────┘
                     │
          ┌──────────▼─────────┐
          │ ┌────────────────┐ │
          │ │  API Gateway   │ │
          │ │    Endpoint    │ │
          │ └────────────────┘ │
          └─────────┬──────────┘
                    │
                    │
         ┌──────────▼──────────┐
         │ ┌────────────────┐  │
         │ │                │  │
         │ │     Lambda     │  │
         │ │    Function    │  │
         │ │                │  │
         │ └────────────────┘  │
         └─────────────────────┘
                    │
                    │
                    ▼
         ┌────────────────────┐
         │                    │
         │      Do stuff      │
         │                    │
         └────────────────────┘
```

