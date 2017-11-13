什么是 Serverless 架构？？
===

对于我而言，缺乏大量的后台架构实践经验，也需要大量的 DevOps。

开发者无需考虑服务器细节，只需要负责编写发生某些事件后所需执行的代码。

事件驱动

JavaScript 机制。

并不一定使用这些云服务，如 AWS，才能称为 Serverless。诸如我的同事 《[Serverless 实战：打造个人阅读追踪系统](https://blog.jimmylv.info/2017-06-30-serverless-in-action-build-personal-reading-statistics-system/)》，采用的是

IFTTT + WebTask + GitHub Webhook + GitHub

意味着，你所有的服务中的一部分运行在 xxx 上，

Serverless 的优势
---

**运营成本**

对于，初创公司来说，他们没有基础设施，也没有财力，也可能没有能力去建设基础设施。采用云服务往往是最好的选择，可以节省大量的资金。与此同时，诸如 AWS 这样庞大的系统，对于创业公司的程序员来说，也不能容易消化掉的一个系统。

而如果一家创业公司采用的是 Serverless，而不是使用云服务器。那么，他就会拥有更多的时间去开发，不需要担心维护。只需要为运行时的软件付钱。

按需计算就意味着，在请求到来的时候，才运行函数。没有请求的时候，是不算钱的。

| 内存 (MB) | 	每个月的免费套餐秒数	|  每 100ms 的价格 (USD) | 
|----------|---------------------|-----------------------|
| 128	     | 3,200,000	         | 0.000000208          |
| 1024	   | 400,000	           | 0.000001667          |

**开发成本**


### 更少的代码、更快的速度

更少的代码，意味着更少的 bug


**扩展能力**

Serverless 的背后是 诸如 AWS Lambda 这样的 FaaS（Function as a Services）。

对于传统应用来说，要应对更多的请求的方式，就是部署更多的实例。然而，这个时候往往已经来不及了。而对于 FaaS 来说，我们并不需要这么做，FaaS 会自动的扩展。它可以在需要时尽可能多地启动实例副本，而不会发生冗长的部署和配置延迟。

### 管理？？

### 快速启动

Serverelss 的原则
---

**编写单一用途的无状态函数**

每一个服务尽可能的小，不一定拥有数据库，也可以共用。

**设计基于推送的、事件驱动的管道**

**集成第三方服务**

Auth0 例子、GitHub Hook 示例

Serverless 的适用场景
---

 - 事件驱动的数据编程
 - Web 应用
 - 移动应用
 - 物联网应用
 - 事件流
 - 应用生态
 
### 发送通知（邮件、短信等）

事件触发，对实时性的要求相对没有那么高~~

### 轻量级 API

Serverless 特别适合于，轻量级快速变化地 API。

其实，我一直想举一个 Featrue Toggle 的例子，尽管有一些不合适。但是，可能是最有价值的部分。

### 数据统计

统计本身只需要很少的计算量，但是生成图表，则可以定期生成。

### 大量计算（AI）

低频高内存计算

### 物联网

如 IoT。

当我们谈及物联网的时候，我们会讨论事件触发、传输协议、海量数据（数据存储、数据分析）。

对接不同的硬件，本身就是一种挑战。

### Trigger 及定时任务

定时爬虫机器人

### 精益创业

快速验证一个想法 MVP。

Dropbox 创业历史的示例。

AWS 提供一系列的工具：

 - Cognito 用于用户授权
 - Dynamo 存储数据
 - Lambda 计算
 - API Gateway 进行 API
 - blabla

### Chat 机器人

聊天机器人，也是一个相当好的应用场景。

Message，

But，由于国内的条件限制（信息监管），这并不是一件容易的事。因此，从渠道（如微信、blabla）上，都在尽可能地降低这方面的可能性。

### 博客系统

过去的几年里，我一直在尝试将我的博客迁移到云服务上，而不是某个主机。
 
与微服务的关系
—--

微服务并不能替换大量的单体应用


优势：**编写单一用途的无状态函数**。

这一点与微服务是相当类似。

相似的，它们是相辅相成的。

Serverless 的问题
---

### 完全依赖于云服务


应对方案，建立隔离层。

这意味着，你需要建议隔离层，

 - 隔离 API 网关
 - 隔离数据库层，考虑到市面上还没有成熟的 ORM 工具，让你即支持 Firebase，又支持 DynamoDB 

### 冷启动

据 New Relic 官方博客《[Understanding AWS Lambda Performance—How Much Do Cold Starts Really Matter?](https://blog.newrelic.com/2017/01/11/aws-lambda-cold-start-optimization/)》称，AWS Lambda 的冷启动时间。

![AWS 启动时间](aws-lambda-monitoring-functions-chart.png)

### 严重依赖第三方 API

是的，

在这种情况下，只能将不重要的 API 放在 Serverless 上。

当你已经有大量的基础设施的时候，Serverless 对于你来说，并不是一个好东西。

### 缺乏调试和开发工具

你需要一遍又一遍地上传代码，每次上传的时候，你就好像是在部署服务器。然后 Fuck the。

当我使用 Serverless Framework 的时候，遇到了这样的问题。后来，我发现了 serverless-offline，问题有一些改善。

然而，对于日志系统来说，这仍然是一个艰巨的挑战。

### 构建复杂

早先，在知道 AWS Lambda 之后，我本来想进行一些尝试。但是 CloudForamtion 让我觉得太难了，它的配置是如此的复杂，并且难以编写。

我使用的是 Serverless，考虑到 CloudForamtion 的复杂度。

### 自然限制

使用多少内存、CPU 限制等等

### 复杂的逻辑不易迁移

### 缺乏基础设施

迁移方案
---

Express 应用示例

Serverless 框架 
---

### Serverless 

### Apex

### Apache OpenWhisk
