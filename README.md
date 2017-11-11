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

*   [Serverless 架构应用开发指南](http://serverless.ink/#serverless-架构应用开发指南)
*   [什么是 Serverless 架构？？](http://serverless.ink/#什么是-serverless-架构)
    *   [优势](http://serverless.ink/#优势)
        *   [运营成本](http://serverless.ink/#运营成本)
        *   [开发成本](http://serverless.ink/#开发成本)
        *   [扩展能力](http://serverless.ink/#扩展能力)
        *   [管理？？](http://serverless.ink/#管理)
    *   [原则](http://serverless.ink/#原则)
        *   [编写单一用途的无状态函数](http://serverless.ink/#编写单一用途的无状态函数)
        *   [设计基于推送的、事件驱动的管道](http://serverless.ink/#设计基于推送的事件驱动的管道)
        *   [集成第三方服务](http://serverless.ink/#集成第三方服务)
    *   [适用场景](http://serverless.ink/#适用场景)
        *   [发送通知（邮件、短信等）](http://serverless.ink/#发送通知邮件短信等)
        *   [轻量级 API](http://serverless.ink/#轻量级-api)
        *   [数据统计](http://serverless.ink/#数据统计)
        *   [大量计算（AI）](http://serverless.ink/#大量计算ai)
        *   [物联网](http://serverless.ink/#物联网)
        *   [Trigger 及定时任务](http://serverless.ink/#trigger-及定时任务)
        *   [精益创业](http://serverless.ink/#精益创业)
        *   [Chat 机器人](http://serverless.ink/#chat-机器人)
        *   [博客系统](http://serverless.ink/#博客系统)
    *   [优势](http://serverless.ink/#优势-1)
        *   [更少的代码、更快的速度](http://serverless.ink/#更少的代码更快的速度)
        *   [可扩展性](http://serverless.ink/#可扩展性)
        *   [快速启动](http://serverless.ink/#快速启动)
    *   [问题](http://serverless.ink/#问题)
        *   [严重依赖第三方 API](http://serverless.ink/#严重依赖第三方-api)
        *   [缺乏调试和开发工具](http://serverless.ink/#缺乏调试和开发工具)
        *   [构建复杂](http://serverless.ink/#构建复杂)
        *   [自然限制](http://serverless.ink/#自然限制)
        *   [复杂的逻辑不易迁移](http://serverless.ink/#复杂的逻辑不易迁移)
        *   [缺乏基础设施](http://serverless.ink/#缺乏基础设施)
    *   [迁移方案](http://serverless.ink/#迁移方案)
    *   [Serverless 框架](http://serverless.ink/#serverless-框架)
        *   [Serverless](http://serverless.ink/#serverless)
        *   [Apex](http://serverless.ink/#apex)
        *   [Apache OpenWhisk](http://serverless.ink/#apache-openwhisk)
*   [Serverless 的 hello, world](http://serverless.ink/#serverless-的-hello-world)
    *   [Serverless 框架 hello, world](http://serverless.ink/#serverless-框架-hello-world)
        *   [一、安装 serverless 框架](http://serverless.ink/#一安装-serverless-框架)
        *   [二、设置 aws 凭证。](http://serverless.ink/#二设置-aws-凭证)
        *   [三、创建 hello-world 服务](http://serverless.ink/#三创建-hello-world-服务)
        *   [四、部署及测试：](http://serverless.ink/#四部署及测试)
*   [AWS Lambda 动态返回 HTML](http://serverless.ink/#aws-lambda-动态返回-html)
*   [使用 S3 部署静态网站](http://serverless.ink/#使用-s3-部署静态网站)
    *   [配置 serverless-finch](http://serverless.ink/#配置-serverless-finch)
    *   [静态内容](http://serverless.ink/#静态内容)
*   [基于 AWS S3 静态存储的 CRUD](http://serverless.ink/#基于-aws-s3-静态存储的-crud)
    *   [概念：API Gateway 与 S3](http://serverless.ink/#概念api-gateway-与-s3)
    *   [基于 S3 的 Serverless CRUD](http://serverless.ink/#基于-s3-的-serverless-crud)
    *   [上传原理](http://serverless.ink/#上传原理)
    *   [Serverless S3 CRUD 示例](http://serverless.ink/#serverless-s3-crud-示例)
*   [使用 DynamoDB 数据库创建 REST API](http://serverless.ink/#使用-dynamodb-数据库创建-rest-api)
    *   [Serverless DynamoDB 示例配置](http://serverless.ink/#serverless-dynamodb-示例配置)
    *   [Serverless DynamoDB 示例代码](http://serverless.ink/#serverless-dynamodb-示例代码)
    *   [Serverless DynamoDB 部署](http://serverless.ink/#serverless-dynamodb-部署)
    *   [Serverless DynamoDB 测试](http://serverless.ink/#serverless-dynamodb-测试)
    *   [其它操作](http://serverless.ink/#其它操作)
*   [Express + React 实现 Serverless 的服务端渲染](http://serverless.ink/#express-react-实现-serverless-的服务端渲染)
    *   [Serverless + Express](http://serverless.ink/#serverless-express)
    *   [Express + React 进行服务端渲染](http://serverless.ink/#express-react-进行服务端渲染)
*   [使用自定义域名](http://serverless.ink/#使用自定义域名)
    *   [Serveress Domain Manager](http://serverless.ink/#serveress-domain-manager)
*   [Serverless 的微信公共平台](http://serverless.ink/#serverless-的微信公共平台)
    *   [创建 Serverless 服务](http://serverless.ink/#创建-serverless-服务)
    *   [引入 node-wechat](http://serverless.ink/#引入-node-wechat)
    *   [配置 APP_ID 和 TOKEN 等](http://serverless.ink/#配置-app_id-和-token-等)
    *   [配置 Route 53 与 API Gateway](http://serverless.ink/#配置-route-53-与-api-gateway)
    *   [添加微信公众平号服务](http://serverless.ink/#添加微信公众平号服务)
    *   [部署](http://serverless.ink/#部署)
*   [基于 Kinesis Streams 的数据流分析](http://serverless.ink/#基于-kinesis-streams-的数据流分析)
    *   [Amazon Kinesis Streams](http://serverless.ink/#amazon-kinesis-streams)
    *   [Serverless + Kinesis Streams](http://serverless.ink/#serverless-kinesis-streams)
*   [Serverless 数据分析，Kinesis Firehose 持久化数据到 S3](http://serverless.ink/#serverless-数据分析kinesis-firehose-持久化数据到-s3)
    *   [Serverless Kinesis Firehose 代码](http://serverless.ink/#serverless-kinesis-firehose-代码)
    *   [安装及测试](http://serverless.ink/#安装及测试)
*   [创建邮件发送 API](http://serverless.ink/#创建邮件发送-api)
    *   [Serverless Email 发送](http://serverless.ink/#serverless-email-发送)
    *   [Serverless Email 发送测试](http://serverless.ink/#serverless-email-发送测试)
*   [创建登录系统](http://serverless.ink/#创建登录系统)
    *   [Serverless Auth0 前端代码](http://serverless.ink/#serverless-auth0-前端代码)
    *   [Serverless Auth0 后台代码](http://serverless.ink/#serverless-auth0-后台代码)
        *   [serverless.yml 配置](http://serverless.ink/#serverless.yml-配置)
    *   [配置及部署](http://serverless.ink/#配置及部署)
        *   [清理](http://serverless.ink/#清理)
    *   [结论](http://serverless.ink/#结论)
*   [在本地部署与调试](http://serverless.ink/#在本地部署与调试)
    *   [serverless-offline](http://serverless.ink/#serverless-offline)
    *   [本地搭建 serverless-offline 与 DynamoDB 环境](http://serverless.ink/#本地搭建-serverless-offline-与-dynamodb-环境)
    *   [本地测试 serverless-offline 与 DynamoDB](http://serverless.ink/#本地测试-serverless-offline-与-dynamodb)
*   [如何编写 Serverless 应用的测试](http://serverless.ink/#如何编写-serverless-应用的测试)
    *   [Serverless 应用的测试](http://serverless.ink/#serverless-应用的测试)
    *   [步骤](http://serverless.ink/#步骤)
        *   [创建测试](http://serverless.ink/#创建测试)
        *   [运行测试](http://serverless.ink/#运行测试)
        *   [更准确的测试](http://serverless.ink/#更准确的测试)
    *   [结论](http://serverless.ink/#结论-1)
*   [多个语言运行环境](http://serverless.ink/#多个语言运行环境)
    *   [Serverless 多个语言运行环境](http://serverless.ink/#serverless-多个语言运行环境)
    *   [部署及测试](http://serverless.ink/#部署及测试)
*   [AWS IoT 服务开发](http://serverless.ink/#aws-iot-服务开发)
    *   [Serverless 框架安装服务](http://serverless.ink/#serverless-框架安装服务)
    *   [部署 AWS IoT Serverless 服务](http://serverless.ink/#部署-aws-iot-serverless-服务)
    *   [查看日志](http://serverless.ink/#查看日志)
*   [Serverless 应用开发指南：CRON 定时执行 Lambda 任务](http://serverless.ink/#serverless-应用开发指南cron-定时执行-lambda-任务)
    *   [Serverless 定时任务](http://serverless.ink/#serverless-定时任务)
        *   [rate 表达式](http://serverless.ink/#rate-表达式)
        *   [cron 表达式](http://serverless.ink/#cron-表达式)
    *   [部署](http://serverless.ink/#部署-1)

License
---

[![Phodal's Article](http://brand.phodal.com/shields/article-small.svg)](https://www.phodal.com/) [![Phodal's Book](http://brand.phodal.com/shields/book-small.svg)](https://www.phodal.com/)


© 2017 [Phodal Huang](https://www.phodal.com). The **code** is distributed under the MIT License. See `LICENSE` in this directory.

© 2017 [Phodal Huang](https://www.phodal.com). The **content** is distributed under the Creative Commons Attribution-Noncommercial-No Derivative Works 3.0 License. See `LICENSE` in this directory.

[待我代码编成，娶你为妻可好](http://www.xuntayizhan.com/blog/ji-ke-ai-qing-zhi-er-shi-dai-wo-dai-ma-bian-cheng-qu-ni-wei-qi-ke-hao-wan/)
