Serverless 架构应用开发指南
===

> Serverless 架构是指大量依赖第三方服务(也叫做后端即服务，即“BaaS”)或暂存容器中运行的自定义代码(函数即服务，即“FaaS”)的应用程序，函数是无服务器架构中抽象语言运行时的最小单位。在这种架构中，我们并不看重运行一个函数需要多少 CPU 或 RAM 或任何其他资源，而是更看重运行函数所需的时间，我们也只为这些函数的运行时间付费。[^serverless]

[^serverless]: http://www.infoq.com/cn/news/2017/04/2017-Serverless

``注意事项``

在本系列的文章中，主要采用了 Serverless Framework 来简化开发和部署流程。

> Serverless Framework是无服务器应用框架和生态系统，旨在简化开发和部署AWS Lambda应用程序的工作。Serverless Framework 作为 Node.js NPM 模块提供，填补了AWS Lambda 存在的许多缺口。它提供了多个样本模板，可以迅速启动 AWS Lambda 开发。
