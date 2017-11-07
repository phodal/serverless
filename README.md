Serverless 架构应用开发指南
===

> Serverless 架构是指大量依赖第三方服务(也叫做后端即服务，即“BaaS”)或暂存容器中运行的自定义代码(函数即服务，即“FaaS”)的应用程序，函数是无服务器架构中抽象语言运行时的最小单位。在这种架构中，我们并不看重运行一个函数需要多少 CPU 或 RAM 或任何其他资源，而是更看重运行函数所需的时间，我们也只为这些函数的运行时间付费。[^serverless]

[^serverless]: http://www.infoq.com/cn/news/2017/04/2017-Serverless

``注意事项``

在本系列的文章中，主要采用了 Serverless Framework 来简化开发和部署流程。

> Serverless Framework是无服务器应用框架和生态系统，旨在简化开发和部署AWS Lambda应用程序的工作。Serverless Framework 作为 Node.js NPM 模块提供，填补了AWS Lambda 存在的许多缺口。它提供了多个样本模板，可以迅速启动 AWS Lambda 开发。

Achitecture
---

![Serverless Application Architecture](images/serverless-spa-architecture.png)

目录
---

*   [Serverless 应用开发指南：serverless 的 hello, world](https://phodal.github.io/serverless-guide/#serverless-应用开发指南serverless-的-hello-world)
    *   [Serverless 框架 hello, world](https://phodal.github.io/serverless-guide/#serverless-框架-hello-world)
        *   [一、安装 serverless 框架](https://phodal.github.io/serverless-guide/#一安装-serverless-框架)
        *   [二、设置 aws 凭证。](https://phodal.github.io/serverless-guide/#二设置-aws-凭证)
        *   [三、创建 hello-world 服务](https://phodal.github.io/serverless-guide/#三创建-hello-world-服务)
        *   [四、部署及测试：](https://phodal.github.io/serverless-guide/#四部署及测试)
*   [Serverless 应用开发指南： Node.js 编程返回动态 HTML](https://phodal.github.io/serverless-guide/#serverless-应用开发指南-node.js-编程返回动态-html)
*   [Serverless 应用开发指南：API Gateway + S3 + AWS Lambda 打造 CRUD](https://phodal.github.io/serverless-guide/#serverless-应用开发指南api-gateway-s3-aws-lambda-打造-crud)
    *   [概念：API Gateway 与 S3](https://phodal.github.io/serverless-guide/#概念api-gateway-与-s3)
    *   [基于 S3 的 Serverless CRUD](https://phodal.github.io/serverless-guide/#基于-s3-的-serverless-crud)
    *   [上传原理](https://phodal.github.io/serverless-guide/#上传原理)
    *   [Serverless S3 CRUD 示例](https://phodal.github.io/serverless-guide/#serverless-s3-crud-示例)
*   [Serverless 开发指南：AWS IoT 服务开发](https://phodal.github.io/serverless-guide/#serverless-开发指南aws-iot-服务开发)
    *   [Serverless 框架安装服务](https://phodal.github.io/serverless-guide/#serverless-框架安装服务)
    *   [部署 AWS IoT Serverless 服务](https://phodal.github.io/serverless-guide/#部署-aws-iot-serverless-服务)
    *   [查看日志](https://phodal.github.io/serverless-guide/#查看日志)
*   [Serverless 应用开发指南：使用 S3 部署静态网站](https://phodal.github.io/serverless-guide/#serverless-应用开发指南使用-s3-部署静态网站)
    *   [配置 serverless-finch](https://phodal.github.io/serverless-guide/#配置-serverless-finch)
    *   [静态内容](https://phodal.github.io/serverless-guide/#静态内容)
*   [Serverless 应用开发指南：Lambda + API Gateway + DynamoDB 制作 REST API](https://phodal.github.io/serverless-guide/#serverless-应用开发指南lambda-api-gateway-dynamodb-制作-rest-api)
    *   [Serverless DynamoDB 示例配置](https://phodal.github.io/serverless-guide/#serverless-dynamodb-示例配置)
    *   [Serverless DynamoDB 示例代码](https://phodal.github.io/serverless-guide/#serverless-dynamodb-示例代码)
    *   [Serverless DynamoDB 部署](https://phodal.github.io/serverless-guide/#serverless-dynamodb-部署)
    *   [Serverless DynamoDB 测试](https://phodal.github.io/serverless-guide/#serverless-dynamodb-测试)
    *   [其它操作](https://phodal.github.io/serverless-guide/#其它操作)
*   [Serverless 应用开发指南：Serverless + Express 的 React 服务端渲染](https://phodal.github.io/serverless-guide/#serverless-应用开发指南serverless-express-的-react-服务端渲染)
    *   [Serverless + Express](https://phodal.github.io/serverless-guide/#serverless-express)
    *   [Express + React 进行服务端渲染](https://phodal.github.io/serverless-guide/#express-react-进行服务端渲染)
*   [Serverless 应用开发指南：CRON 定时执行 Lambda 任务](https://phodal.github.io/serverless-guide/#serverless-应用开发指南cron-定时执行-lambda-任务)
    *   [Serverless 定时任务](https://phodal.github.io/serverless-guide/#serverless-定时任务)
        *   [rate 表达式](https://phodal.github.io/serverless-guide/#rate-表达式)
        *   [cron 表达式](https://phodal.github.io/serverless-guide/#cron-表达式)
    *   [部署](https://phodal.github.io/serverless-guide/#部署)
*   [Serverless 应用开发指南： API Gateway 与 Route53 自定义域名](https://phodal.github.io/serverless-guide/#serverless-应用开发指南-api-gateway-与-route53-自定义域名)
    *   [Serveress Domain Manager](https://phodal.github.io/serverless-guide/#serveress-domain-manager)
*   [Serverless 应用开发指南：基于 Serverless 与 Lambda 的微信公共平台](https://phodal.github.io/serverless-guide/#serverless-应用开发指南基于-serverless-与-lambda-的微信公共平台)
    *   [创建 Serverless 服务](https://phodal.github.io/serverless-guide/#创建-serverless-服务)
    *   [引入 node-wechat](https://phodal.github.io/serverless-guide/#引入-node-wechat)
    *   [配置 APP_ID 和 TOKEN 等](https://phodal.github.io/serverless-guide/#配置-app_id-和-token-等)
    *   [配置 Route 53 与 API Gateway](https://phodal.github.io/serverless-guide/#配置-route-53-与-api-gateway)
    *   [添加微信公众平号服务](https://phodal.github.io/serverless-guide/#添加微信公众平号服务)
    *   [部署](https://phodal.github.io/serverless-guide/#部署-1)
*   [Serverless 应用开发指南：基于 Kinesis Streams 的数据流分析（上）](https://phodal.github.io/serverless-guide/#serverless-应用开发指南基于-kinesis-streams-的数据流分析上)
    *   [Amazon Kinesis Streams](https://phodal.github.io/serverless-guide/#amazon-kinesis-streams)
*   [Serverless 应用开发指南：使用 SES 创建邮件发送接口](https://phodal.github.io/serverless-guide/#serverless-应用开发指南使用-ses-创建邮件发送接口)
    *   [Serverless Email 发送](https://phodal.github.io/serverless-guide/#serverless-email-发送)
    *   [Serverless Email 发送测试](https://phodal.github.io/serverless-guide/#serverless-email-发送测试)
    *   [Serverless + Kinesis Streams](https://phodal.github.io/serverless-guide/#serverless-kinesis-streams)

License
---

[![Phodal's Article](http://brand.phodal.com/shields/article-small.svg)](https://www.phodal.com/) [![Phodal's Book](http://brand.phodal.com/shields/book-small.svg)](https://www.phodal.com/)


© 2017 [Phodal Huang](https://www.phodal.com). The **code** is distributed under the MIT License. See `LICENSE` in this directory.

© 2017 [Phodal Huang](https://www.phodal.com). The **content** is distributed under the Creative Commons Attribution-Noncommercial-No Derivative Works 3.0 License. See `LICENSE` in this directory.

[待我代码编成，娶你为妻可好](http://www.xuntayizhan.com/blog/ji-ke-ai-qing-zhi-er-shi-dai-wo-dai-ma-bian-cheng-qu-ni-wei-qi-ke-hao-wan/)
