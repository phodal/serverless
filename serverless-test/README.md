Serverless 架构应用开发：如何编写 Serverless 应用的测试
---

如 Serverless Framework 官方所说

虽然 Serverless 架构在服务业务逻辑方面引入了很多简单性，但是它的一些特性给测试带来了挑战。他们是：

 - Serverless 架构是独立的分布式服务的集成，它们必须被独立地和一起地测试。
 - Serverless 架构依赖于互联网、云服务，这些服务很难在本地模拟。
 - Serverless 架构可以具有事件驱动的异步工作流程，这些工作流程很难完全仿真。

因此官方建议：

 - 编写您的业务逻辑，使其与 FaaS 提供商（例如，AWS Lambda）分开，以保持提供者独立性，可重用性和更易于测试。
 - 当您的业务逻辑与FaaS提供商分开编写时，您可以编写传统的单元测试以确保其正常工作。
 - 编写集成测试以验证与其他服务的集成是否正常工作。

Serverless 的测试金字塔
---

在传统的测试金字塔里，我们会写更多的单元测试，并尽可能地尽少集成测试。同样的，在 Serverless 架构应用里，我们会写同样数量的单元测试，只是会写更多地集成测试，用于测试与服务间的集成。而这些测试，往往更加依赖于网络，并且这些测试越需要我们隔离架构层级。

因而，这种情况下，我们需要在测试上花费更多的精力。

对于单元测试来说，在之前的 [Express 示例](https://www.phodal.com/blog/serverless-development-guide-express-react-build-server-side-rendering/)里，我们做了一个不错的 Demo。我们隔离了 Express 与 Lambda 函数之间的代码，只需要再加上一个本地的 Express 环境，那么我们就可以直接在本地运行了。而借助于上一篇中提供的 [serverless-offline](https://www.phodal.com/blog/serverless-architecture-development-serverless-offline-localhost-debug-test/)，我们则可以隔离本地数据库。

步骤
---

```
yarn add --dev serverless-mocha-plugin
```

添加到 ``serverless.yml`` 文件中：

```
plugins:
  - serverless-mocha-plugin
```

### 创建函数

```
sls create function -f functionName --handler handler
```

```
sls create function -f myFunction --handler functions/myFunction/index.handler
```

### 创建测试

```
sls create test -f functionName
```

### 运行测试

```
sls invoke test [--stage stage] [--region region] [-f function1] [-f function2] [...]
```

