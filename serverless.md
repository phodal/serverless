
Serverless 架构应用开发指南
===

> Serverless 架构是指大量依赖第三方服务（也叫做后端即服务，即“BaaS”）或暂存容器中运行的自定义代码（函数即服务，即“FaaS”）的应用程序，函数是无服务器架构中抽象语言运行时的最小单位。在这种架构中，我们并不看重运行一个函数需要多少 CPU 或 RAM 或任何其他资源，而是更看重运行函数所需的时间，我们也只为这些函数的运行时间付费。

``注意事项``

在本系列的文章中，主要采用了 Serverless Framework 来简化开发和部署流程。

> Serverless Framework是无服务器应用框架和生态系统，旨在简化开发和部署AWS Lambda应用程序的工作。Serverless Framework 作为 Node.js NPM 模块提供，填补了AWS Lambda 存在的许多缺口。它提供了多个样本模板，可以迅速启动 AWS Lambda 开发。

Serverless 架构
===

> 花了 1000G，我终于弄清楚了 Serverless 是什么？

在过去的 24 小时，我通过微信公众号的『电子书』一事，大概处理了 8000 个请求：

![Serverless 请求统计](images/counts.png)

大部分的请求都是在 200ms 内完成的，而在最开始的请求潮里（刚发推送的时候，十分钟里近 1500 个请求），平均的响应时间都在 50ms 内。

![Serverless 请求时间](images/times.png)

这也表明了，Serverless 相当的可靠。显然，当请求越多的时候，响应时间越快，这简直有违常理——一般来说，随着请求的增加，响应时间会越来越慢。

毫无疑问，在最近的几年里，微服务渐渐成为了一个相当流行的架构风格。微服务大致从 2014 年起，开始流行开来，如下图所示：

![microservices vs serverless](images/microservice-compare-serverless.png)

而 Serverless 是从 2016 年起，开始受到开发者的关注。并且从其发展趋势来看，它大有可能在两年后，拥有今天微服务一样的地位。可见，它是一个相当具有潜力的架构。

什么是 Serverless 架构？？
---

为了弄清 Serverless 究竟是什么东西，Serverless 到底是个什么，我使用 Serverless 尝试了一个又一个示例，我自己也做了四五个应用，总算是对 Serverelss 有了一个大致上的认识。

### 虚拟化与隔离

> 开发人员为了保证开发环境的正确（即，这个 Bug 不是环境因素造成的），想出了一系列的隔离方式：虚拟机、容器虚拟化、语言虚拟机、应用容器（如 Java 的 Tomcat）、虚拟环境（如 Python 中的 virtualenv），甚至是独立于语言的 DSL。[^full_stack]

从最早的物理服务器开始，我们都在不断地抽象或者虚拟化服务器。

![服务器发展](images/server-growth.jpg)

 - 我们使用 XEN、KVM等虚拟化技术，隔离了硬件以及运行在这之上的操作系统。
 - 我们使用云计算进一步地自动管理这些虚拟化的资源。
 - 我们使用 Docker 等容器技术，隔离了应用的操作系统与服务器的操作。

现在，我们有了 Serverless，我们可以隔离操作系统，乃至更底层的技术细节。

### 为什么是花了 1000G ？

现在，让我简单地解释『花了 1000G，我终于弄清楚了 Serverless 是什么？』这句话，来说说 Serverless 到底是什么鬼？

在实践的过程中，我采用的是 AWS Lambda 作为 Serverless 服务背后的计算引擎。AWS Lambda 是一种函数即服务（Function-as-a-Servcie，FaaS）的计算服务，简单的来说就是：开发人员直接编写运行在云上的函数、功能、服务。由云服务产商提供操作系统、运行环境、网关等一系列的基础环境，我们只需要关注于编写我们的业务代码即可。

是的，你没听错，我们只需要**考虑怎么用代码提供价值即可**。我们甚至连可扩展、蓝绿部署等一系列的问题都不用考虑，Amazon 优秀的运营工程师已经帮助我们打造了这一系列的基础设施。并且与传统的 AWS 服务一样，如 Elastic Compute Cloud（EC2），它们都是按流量算钱的。

那么问题又来了，它到底是怎么对一个函数收钱的。我在 Lambda 函数上运行一个 Hello, world 它会怎么收我的钱呢？

如果要对一个运行的函数收费，那么想必只有运行时间、CPU、内存占用、硬盘这几个条件。可针对于不同的需求，提供不同的 CPU 是一件很麻烦的事。对于代码来说，一个应用占用的硬盘空间几乎可以忽略不计。当然，这些应用会在你的 S3 上有一个备份。于是，诸如 AWS 采用的是运行时间 + 内存的计算方式。

| 内存 (MB) | 	每个月的免费套餐秒数 |  每 100ms 的价格 (USD) |
|----------|---------------------|----------------------|
| 128	   |  3,200,000	         | 0.000000208          |
| 192	   | 2,133,333           | 0.000000313 			|
| 256	   | 1,600,000	         | 0.000000417  	 	|
| ...      | ...				 | ...					|	
| 1024	   | 400,000	         | 0.000001667          |
| ...      | ...				 | ...					|

在运行程序的时候，AWS 会统计出一个时间和内存，如下所示：

```
REPORT RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d	Duration: 2.49 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 20 MB
```

其中的 ``Memory Size`` 即是我们选用的套餐类型，Duration 即是运行的时间，Max Memory Used 是我们应用运行时占用的内存。根据我们的 Max Memory Used 数值及应用的计算量，我们可以很轻松地计算出我们所需要的套餐。

当然，选择不同大小的内存，也意味着选择不同功率的 CPU。

> 在 AWS Lambda 资源模型中，您可以选择您想为函数分配的内存量，并按 CPU 功率和其他资源的比例进行分配。例如，选择 256MB 的内存分配至您的 Lambda 函数的 CPU 功率约是请求 128MB 内存的两倍，若选择 512MB 的内存，其分配的 CPU 功率约是一半。您可以在 128MB 到 1.5GB 的范围间以 64MB 的增量设置您的内存。

因此，如果我们选用 1024M 的套餐，然后运行了 320 次，一共算是使用了 320G 的计算量。而其运行时间会被舍入到最近的 100ms，就算我们运行了 2.49ms，那么也是按 100ms 算的。那么假设，我们的 320 次计算都花了 1s，也就是 10×100ms，那么我们要支付的费用是：10×320×0.000001667=0.0053344刀，即使转成人民币也就是不到 4 毛钱的 0.03627392。

如果我们先用的是 128M 的套餐，那么运行了 2000 次，就是 200G 的计算量了。

如果我们先用的是 128M 的套餐，那么运行了 8000 次，就是 1000G 的计算量了。

不过如上表所示，AWS 为 Lambda 提供了一个免费套餐（无期限地提供给新老用户）包含每月 1M 免费请求以及每月 400 000 GB 秒的计算时间。这就意味着，在很长的时间里，我们一分钱都不用花。

### Serverless 是什么？

而从上节的内容中，我们可以知道这么几点：

 - 在 Serverless 应用中，开发者只需要专注于业务，剩下的运维等工作都不需要操心
 - Serverless 是**真正的按需使用**，请求到来时才开始运行
 - Serverless 是按运行时间和内存来算钱的
 - Serverless 应用严重依赖于特定的云平台、第三方服务

当然这些都是一些虚无缥缈地东西。

按 AWS 官方对于 Serverless 的介绍是这样的：

> 服务器架构是基于互联网的系统，其中应用开发不使用常规的服务进程。相反，它们仅依赖于第三方服务（例如AWS Lambda服务），客户端逻辑和服务托管远程过程调用的组合。”[^aws_serverless]

在一个基于 AWS 的 Serverless 应用里，应用的组成是：

 - 网关 API Gateway
 来接受和处理成千上万个并发 API 调用，包括流量管理、授权和访问控制、监控等
 - 计算服务 Lambda 来进行代码相关的一切计算工作，诸如授权验证、请求、输出等等
 - 基础设施管理 CloudFormation 来创建和配置 AWS 基础设施部署，诸如所使用的 S3 存储桶的名称等
 - 静态存储 S3 作为前端代码和静态资源存放的地方
 - 数据库 DynamoDB 来存储应用的数据
 - 等等

以博客系统为例，当我们访问一篇博客的时候，只是一个 GET 请求，可以由 S3 为我们提供前端的静态资源和响应的 HTML。

![Serverless SPA 架构](images/serverless-spa-architecture.png)

而当我们创建一个博客的时候：

 - 我们的请求先来到了 API Gateway，API Gateway 计费器 + 1
 - 接着请求来到了 Lambda，进行数据处理，如生成 ID、创建时间等等，Lambda 计费器 + 1
 - Lambda 在计算完后，将数据存储到 DynamoDB 上，DynamoDB 计费器 + 1
 - 最后，我们会生成静态的博客到 S3 上，而 S3 只在使用的时候按存储收费。

在这个过程中，我们使用了一系列稳定存在的云服务，并且只在使用时才计费。由于这些服务可以自然、方便地进行调用，我们实际上只需要关注在我们的 Lambda 函数上，以及如何使用这些服务完成整个开发流程。

因此，Serverless 并不意味着没有服务器，只是服务器以特定功能的第三方服务的形式存在。

当然并不一定使用这些云服务（如 AWS），才能称为 Serverless。诸如我的同事在 《[Serverless 实战：打造个人阅读追踪系统](https://blog.jimmylv.info/2017-06-30-serverless-in-action-build-personal-reading-statistics-system/)》，采用的是：IFTTT + WebTask + GitHub Webhook 的技术栈。它只是意味着，你所有的应用中的一部分服务直接使用的是第三方服务。

在这种情况下，系统间的分层可能会变成一个又一个的服务。原本，在今天主流的微服务设计里，每一个领域或者子域都是一个服务。而在 Serverless 应用中，这些领域及子域因为他们的功能，又可能会进一步切分成一个又一个 Serverless 函数。

![更小的函数](images/mono-ms-sls.jpg)

只是这些服务、函数比以往的粒度更加细致。

### 事件驱动编程

Serverless 的运行才计算，便意味着他是一种 “严格” 的事件驱动式计算。

> 事件驱动编程（英语：Event-driven programming）是一种电脑程序设计模型。这种模型的程序运行流程是由用户的动作（如鼠标的按键，键盘的按键动作）或者是由其他程序的消息来决定的。相对于批处理程序设计（batch programming）而言，程序运行的流程是由程序员来决定。批量的程序设计在初级程序设计教学课程上是一种方式。然而，事件驱动程序设计这种设计模型是在交互程序（Interactive program）的情况下孕育而生的。[^wiki_event_driver]

这也意味着，系统在编程模型上有着巨大的改变。在我们编写 GUI 程序，如桌面程序、Web 前端应用，我们都通过监听用户对按钮、链接等组件操作，才开始相应的处理逻辑。这和 Serverless 是相似的，只在用户使用的时候，才会对应用户的行为进行响应。

Serverless 的优势
---

在我使用 Serverless Framework 开发 AWS Serverless 应用的过程中，最方便的莫过于，第一次部署和第二次、第三次部署没有什么区别。只需要执行 ``serverless deploy``，几分钟后，我们代码就运行在线上。如果是一个传统的 AWS 应用，我需要 SSH 到我的服务器上部署，这样才能写好我的自动部署脚本。除此，我还需要担忧这个过程中，有哪些用户有使用。

除了，我觉得的部署方便，还有就是价格合理。我的 AWS EC2 实例上运行着我的博客、以及其他的一些网络。然而，我那 PV 只有 500 左右的博客，大部分时间都是在空转。便觉得有些浪费，可是运行才收费的 Serverless 就不会有这样的问题。可以让我大胆地去使用这些服务。当然了，还有其它一些显著的优势。

### 降低启动成本

当我们作为一家公司开发一个 Web 应用时，在开发的时候，我们需要版本管理服务器、持续集成服务器、测试服务器、应用版本管理仓库等作为基础的服务。线上运行的时候，为了应对大量的请求，我们需要一个好的数据库服务器。当我们的应用面向了普通的用户时，我们需要：

 - 邮件服务，用于发送提醒、注册等服务
 - 短信服务（依国家实名规定），用于注册、登录等用户授权操作

对于大公司而言，这些都是现成的基础设施。可对于新创企业来说，这都是一些启动成本。

#### 减少运营成本

对于初创公司来说，他们没有基础设施，也没有财力，也可能没有能力去建设基础设施。采用云服务往往是最好的选择，可以节省大量的资金。他们可以将注意力放在：创造对用户有价值的产品上。如果一家创业公司采用云服务，而不是自己搭建服务器。那么，他就会拥有**更多的时间**开发业务功能，而不是关注在这些。只需要为运行时的软件付钱。

而采用**函数计算**的 Serverless 与云服务器最大的不同之处在于：**云服务器需要一直运行，而函数计算是按需计算**。按需计算就意味着，在请求到来的时候，才运行函数。没有请求的时候，是不算钱的。

项目初期，其用户数往往是缓慢增长的，而我们在选择服务器的时候，往往会依可能出现的用户来估算。在这个时候，往往会浪费一些不必要的成本。不过，就算用户突然间爆发，Serverless 应用也可以轻松处理。只需要修改一下数据库配置，再重新部署一份。

#### 降低开发成本

一个成功的 Serverless 服务供应商，应该能提供一系列的**配套服务**。这意味着，你只需要在配置文件上写下，这个数据库的表名，那么我们的数据就会存储到对应的数据库里。甚至于，**如果一个当服务提供者提供一系列的函数计算模板，那么我们只需要写好我们的配置即可。这一系列的东西都可以自动、高效的完成。

在这种情况下，**使用某一个云服务，就会调用某一个系统自带的 API 一样简单**。

当然，将应用设计成无状态应用，对于早期的系统，可能是一种挑战。除此，诸如 AWS 这样庞大的系统，对于新手程序员来说，也不能容易消化掉的一个系统。

### 实现快速上线

对于一个 Web 项目来说，启动一个项目需要一系列的 hello, world。当我们在本地搭建环境的时候，是一个 hello, world，当我们将程序部署到开发环境时，也是一个部署相关的 hello, world。虽然看上去有些不同，但是总的来说，都是 it works!。

Serverless 在部署上的优势，使得你可以轻松地实现上线。

#### 更快的部署流水线

实际上，Serverless 应用之所以在部署上有优势，是因为其相当于**内建自动化部署**——我们在开发应用的时候，已经在不断地增强部署功能。

在我们日常的开发中，为了实现自动化部署，我们需要先手动部署，以设计出一个相关无错的部署配置，如 Docker 的 Dockerfile，又或者是 Ansible 的 playbook。除此，我们还需要设计好蓝绿发布等等的功能。

而在函数计算、Serverless 应用里，这些都是由供应商提供的功能。每次我们写完代码，只需要运行一下：``sls deploy`` 就足够了。在诸如 AWS Lambda 的函数计算里，函数一般在上传后几秒钟内，就能做好调用准备。

这就意味着，当我们和日常一样，使用一个模板来开发我们的应用。我们就可以在 Clone 完代码后的几分钟内，完成第一次部署。

唯一的难点，可能是要选用什么配置类型的服务，如选用哪个级别吞吐量的 DynamoDB、哪个内存大小的 Lambda 计算。

#### 更快的开发速度

由于 Serverless 服务提供者，已经准备好了一系列的基础服务。作为开发人员的我们，只需要关注于如何更好去实现业务，而非技术上的一些限制。

服务提供者已经向我们准备，并测试好了这一系列的服务。它们基本上是稳定、可靠的，不会遇上特别大的问题。事实上，当我们拥有足够强大的代码，如使用测试来保证健壮性，那么结合持续集成，我们就可以在 PUSH 代码的时候，直接部署到生产环境。当然，可能不需要这么麻烦，我们只需要添加一个 predeploy 的 hook，在这个 hook 里做一些自动测试的工作，就可以在本地直接发布新的版本。

这个过程里，我们并不需要考虑太多的发布事宜。

### 系统安全性更高

依我维护我博客的经验来看，要保持服务器一直运行不是一件容易的事。在不经意的时候，总会发现有 Cracker 在攻击你网站。我们需要防范不同类型的攻击，如在我的服务器里一直有黑客在尝试密码登录，可是我的博客的服务器是要密钥才能登录的。在一次神奇的尝试登录攻击后，我的 SSH 守护进程崩溃了。这意味着，我只能从 EC2 后台重启服务器。

有了 Serverless，我不再需要担心有人尝试登录系统，因为我都不知道怎么登录服务器。

我不再需要考虑系统底层安全问题，每次登录 AWS EC2，我总需要更新一遍软件；每当我看到某个软件有漏洞时，如之前的 OpenSSH，我就登录上去看一下版本，更新一下软件。真 TM 费时又费力，还没有一点好处。

唯一需要担心的，可能是有人发起 DDOS 攻击。而根据[Could Zombie Toasters DDoS My Serverless Deployment?](https://thenewstack.io/zombie-toasters-eat-startup/)的计算，每百万的请求，大概是 0.2 刀，每小时 360000000 个请求，也就 72 刀。

### 适应微服务架构

如我们所见在最近几年里看到的那样，微服务并没有大量地替换掉单体应用——毕竟使用新的架构来替换旧的系统，在业务上的价值并不大。因此，对于很多企业来说，并没有这样的强烈需求及紧迫性。活着，才是一件更紧迫的事。

而 Serverless 天生就与微服务架构是**相辅相成**的。一个 Serverless 应用拥有自己的网关、数据库、接口，你可还以使用自己喜欢的语言（受限于服务提供者）来开发服务。换句话来说，在这种情形下，一个 Serverless 可能是一个完美的微服务实例。

在可见的一二年里，Serverless 将替换到某些系统中的一些组件、服务。

### 自动扩展能力

Serverless 的背后是 诸如 AWS Lambda 这样的 FaaS（Function as a Services）。

对于传统应用来说，要应对更多的请求的方式，就是部署更多的实例。然而，这个时候往往已经来不及了。而对于 FaaS 来说，我们并不需要这么做，FaaS 会自动的扩展。它可以在需要时尽可能多地启动实例副本，而不会发生冗长的部署和配置延迟。

这依赖于我们的服务是无状态的，我们才能次无忌惮地不断运行起新的实例。

Serverless 的问题
---

作为一个运行时，才启动的应用来说，Serverless 也存在着一个个我们所需要的问题。

### 不适合长时间运行应用

Serverless 在请求到来时才运行。这意味着，当应用不运行的时候就会进入 “休眠状态”，下次当请求来临时，应用将会需要一个启动时间，即**冷启动**。这个时候，可以结合 CRON 的方式或者 CloudWatch 来定期唤醒应用。

如果你的应用需要一直长期不间断的运行、处理大量的请求，那么你可能就不适合采用 Serverless 架构。在这种情况下，采用 EC2 这样的云服务器往往是一种更好的选择。因为 EC2 从价格上来说，更加便宜。

引用 [Lu Zou](https://www.zhihu.com/people/lu-zou-36) 在 《[花了 1000G，我终于弄清楚了 Serverless 是什么（上）：什么是 Serverless 架构？](https://zhuanlan.zhihu.com/p/31122433)》上的评论：

> EC2 相当于你买了一辆车，而 Lambda 相当于你租了你一辆车。

长期租车的成本肯定比买车贵，但是你就少掉了一部分的维护成本。因此，这个问题实际上是一个值得深入计算的问题。

### 完全依赖于第三方服务


是的，当你决定使用某个云服务的时候，也就意味着你可能走了一条不归路。在这种情况下，只能将不重要的 API 放在 Serverless 上。

当你已经有大量的基础设施的时候，Serverless 对于你来说，并不是一个好东西。当我们采用 Serverless 架构的时候，我们就和特别的服务供应商绑定了。我们使用了 AWS 家的服务，那么我们再将服务迁到 Google Cloud 上就没有那么容易了。

我们需要修改一下系列的底层代码，能采取的应对方案，便是建立隔离层。这意味着，在设计应用的时候，就需要：

 - 隔离 API 网关
 - 隔离数据库层，考虑到市面上还没有成熟的 ORM 工具，让你即支持 Firebase，又支持 DynamoDB 
 - 等等

这些也将带给我们一些额外的成本，可能**带来的问题会比解决的问题多**。

### 冷启动时间

如上所说，Serverless 应用存在一个冷启动时间的问题。

据 New Relic 官方博客《[Understanding AWS Lambda Performance—How Much Do Cold Starts Really Matter?](https://blog.newrelic.com/2017/01/11/aws-lambda-cold-start-optimization/)》称，AWS Lambda 的冷启动时间。

![AWS 启动时间](./images/aws-lambda-monitoring-functions-chart.png)

又或者是我之前统计的请求响应时间：

![Serverless 请求时间](images/times.png)

尽管这个冷启动时间大部分情况下，可以在 50ms 以内。而这是对于 Node.js 应用来说，对于拥有虚拟机的 Java 和 C# 可能就没有那么幸运了。

### 缺乏调试和开发工具

当我使用 Serverless Framework 的时候，遇到了这样的问题：缺乏调试和开发工具。后来，我发现了 serverless-offline、dynamodb-local 等一系列插件之后，问题有一些改善。

然而，对于日志系统来说，这仍然是一个艰巨的挑战。

每次你调试的时候，你需要一遍又一遍地上传代码。而每次上传的时候，你就好像是在部署服务器。然后 Fuck 了，我并不能总是快速地定位出问题在哪。于是，我修改了一下代码，添加了一行 ``console.log``，然后又一次地部署了下代码。问题解决了，挺好的，我删了一下 ``console.log``，然后又一次地部署了下代码。

后来，我学乖了，找了一个类似于 log4j 这样的可以分级别纪录日志的 Node.js 库 ``winston``。它可以支持 error、warn、info、verbose、debug、silly 六个不同级别的日志。

### 构建复杂

Serverless 很便宜，但是这并不意味着它很简单。

早先，在知道 AWS Lambda 之后，我本来想进行一些尝试。但是 CloudForamtion 让我觉得太难了，它的配置是如此的复杂，并且难以阅读及编写（JSON 格式）。

考虑到 CloudForamtion 的复杂度，我是在接触了 Serverless Framework 之后，才重新燃起了一些信心。

Serverless Framework 的配置更加简单，采用的是 YAML 格式。在部署的时候，Serverless Framework 会根据我们的配置生成 CloudForamtion 配置。

在那篇《[Kinesis Firehose 持久化数据到 S3](https://www.phodal.com/blog/serverless-development-guide-use-kinesis-firehose-stream-data-s3/)》想着的数据统计文章里，我们介绍了 Serverless 框架的配置。与一般的 Lambda 配置来说，这里的配置就稍微复杂一些。然而，这也并非是一个真正用于生产的配置。我的意思是，真实的应用场景远远比这复杂。

### 语言版本落后

在 Node.js 6 出来的时候，AWS Lambda 只支持 Node.js 4.3.2；在 Node.js 9.0 出来的时候，AWS Lambda 支持到 6.10.3。

如下是 AWS Lambda 支持以下运行时版本：

 - Node.js – v4.3.2 和 6.10.3
 - Java - Java 8
 - Python – Python 3.6 和 2.7
 - .NET 内核 – .NET 内核 1.0.1 (C#)

对于 Java 和 Python 来说，他们的版本上可能基本都是够用的，我不知道 C# 怎么样。但是 Node.js 的版本显然是有点老旧的，但是都 Node.js 9.2.0 了。不过，话说来说，这可能与版本帝 Chrome 带来的前端版本潮有一点关系。

Serverless 的适用场景
---

尽管 Serverless 在编写传统的 Web 应用上，有一定的缺点。然而，它的事件驱动及运行时计算，使得它在某些场景上相当的合适。

### 发送通知

由我们在上一节中提到的，对于诸如 PUSH Notification、[邮件通知接口](https://www.phodal.com/blog/serverless-development-guide-aws-simple-email-service/)、短信，这一类服务来说，他们都需要基础设施来搭建。并且，他们对实时性的要求相对没有那么高。

即使在时间上晚来几秒钟，用户还是能接受的。在我们所见到的短信发送的例子里，一般都会假设用户能在 60 秒内收到短信。因此，在这种时间 1s 的误差，用户也不会恼火的。而对于 APP 的消息推送而言，这种要求就更低了，用户反而不太希望能收到这样的推送

### WebHook

当我们没有服务器，又想要一个 Webhook 来触发我们一系列的操作的时候。我们就可以考虑使用 Serverless，我们不需要一直就这么支付一个服务器的费用。通过 Serverless，我们就可以轻松完成这样的工作，并且节省大量的费用。

一个比较明显的例子，就如 [GitHub Hooks](https://www.phodal.com/blog/serverless-development-guide-create-github-hooks/)

> GitHub 上的 Webhook 允许我们构建或设置在 GitHub.com 上订阅某些事件的 GitHub 应用程序。当触发这些事件之一时，我们将向 webhook 配置的 URL 发送 HTTP POST 有效内容。

比如说，当我们 PUSH 了代码，我们想触发我们的持续集成。这个时候，就可以通过一个 Webhook 来做这样的事情。

### 轻量级 API

Serverless 特别适合于，轻量级快速变化地 API。

其实，我一直没有想到一个合适的例子。在我的假想里，一个 AutoSuggest 的 API 可能就是这样的 API，但是这种 API 在有些时候，往往会伴随着相当复杂的业务。

于是，便想举一个 Featrue Toggle 的例子，尽管有一些不合适。但是，可能是最有价值的部分。

### 物联网

当我们谈及物联网的时候，我们会讨论事件触发、传输协议、海量数据（数据存储、数据分析）。而有了 Serverless，那么再多的数据，处理起来也是相当容易的一件事。

对于一个物联网应用的服务端来说，系统需要收集来自各个地方的数据，并创建一个个 pipeline 来处理、过滤、转换这些数据，并将数据存储到数据库中。

对于硬件开发人员来说，对接不同的硬件，本身就是一种挑战。而直接使用诸如 AWS IoT 这样国，可以在某种程度上，帮助我们更好地开发出写服务端连接的应用。

同时，对于物联网应用的客户端来说，则需要从数据库抽取数据进行展示。这部分，可能算不上是一个挑战点。

### 数据统计分析

数据统计本身只需要很少的计算量，但是生成图表，则可以定期生成。

在接收数据的时候，我们不需要考虑任何延时带来的问题。50~200 ms 的延时，并不会对我们的系统造成什么影响。

### Trigger 及定时任务

对于哪些需要爬虫来抓取和生成的程序来说，Serverless **可能**是一个不错的舞台。

尽管，这样的工作也可以由云服务器来做，我们只需要定时的启动一下服务器。通过服务器中的自启动脚本来做相应的事，但是当我们完成了一系列的工作之后。我们需要将数据存储在一个远程的服务器上。而为了让系统中的其它应用，也能直接访问这些数据。那么，我们可能会考虑使用一个云数据库。这个时候，Serverless 应用看上去更具有吸引力。

在那篇《CRON 定时执行 Lambda 任务》中，我们也可以看到 AWS Lambda 可以支持 Lambda 计算，定时启动服务，并计算。

### 精益创业

![Landing Page](images/launch-page.jpg)

Serverless 的快速上线、开发，意味着它可以快速验证一个想法 MVP。如 Dropbox 在开始的时候，只创造了一个 Landing Page。作为一个想使用这个服务的用户，我们会在其中填上我们的邮箱。

而如果是使用 Serverless 来构建这样的应用，那么我们只需要创建一个静态页面，然后用一个 Serverless 服务来保存用户的邮箱到数据库中，如我在 GitHub 上的 [serverless-landingpage](https://github.com/phodal/serverless-landingpage) 所做的那样。

### Chat 机器人

聊天机器人，也是一个相当好的应用场景。

But，由于国内的条件限制（信息监管），这并不是一件容易的事。因此，从渠道（如微信、blabla）上，都在尽可能地降低这方面的可能性。

但是，我们还可以做一个微信公众号的服务。当用户输入一个关键词时，做出相应的回复，这实质上和聊天机器人是差不多的。只需要结合《[基于 Serverless 与 Lambda 的微信公共平台](https://www.phodal.com/blog/serverless-development-guide-serverless-lambda-wechat-public-platform/)》 就可以轻松实现，并实现快速上线。

其它
---

### 迁移方案

Express 应用示例

### Serverless Framework

> Serverless Framework是无服务器应用框架和生态系统，旨在简化开发和部署AWS Lambda应用程序的工作。Serverless Framework 作为 Node.js NPM 模块提供，填补了AWS Lambda 存在的许多缺口。它提供了多个样本模板，可以迅速启动 AWS Lambda 开发。

### Apex

> Apex可以轻松地构建、部署和管理AWS Lambda功能。通过节点可使用由AWS Lambda(如Golang)所不支持的语言，js shim注入到构建中，为测试功能、回滚部署、查看度量、跟踪日志、连接到构建系统以及更多的功能提供了各种工作流相关工具。

### Apache OpenWhisk

> OpenWhisk是一个分布式的、事件驱动的计算服务。OpenWhisk运行应用程序逻辑，以应对事件或直接通过HTTP调用网络或移动应用。

[^aws_serverless]: https://aws.amazon.com/cn/blogs/china/iaas-faas-serverless/

[^full_stack]: 选自《全栈应用开发：精益实践》的『隔离与运行环境』一节

[^wiki_event_driver]:https://zh.wikipedia.org/wiki/%E4%BA%8B%E4%BB%B6%E9%A9%85%E5%8B%95%E7%A8%8B%E5%BC%8F%E8%A8%AD%E8%A8%88


Serverless 的 hello, world
===

原文链接：[Serverless 应用开发指南：serverless 的 hello, world](https://www.phodal.com/blog/serverless-development-guid-serverless-framework-hello-world/)

在翻译了几篇 serverless 与物联网相关的文章之后，我开始想着好好掌握一下 serverless 的相关知识。

我对于 serverless 的第一认知是：**Serverless 是由一堆云服务构建后端服务的，如存储、计算、授权都是由不同的服务来构建的。**而作为一个开发人员，我们所要做的就是了解如何搭配不同的云服务。

因此，在进行更多的定义之前，我打算先熟悉一下 serverless，以便于我更好地了解什么是 serverless 应用开发。

Serverless 框架 hello, world
---

考虑到直接使用 aws lambda 编写 serverless，对于我这样的新手相当的有挑战性。于是，我便先选择了 Serverless 框架，GitHub: https://github.com/serverless/serverless。

先让我们按官网的 demo，进行实验。开始之前，除了拥有一台电脑，你还需要有一个 AWS 账号。AWS 提供一年的免费试用，你所需要做的就是办一张支持 visa 的信用卡。

### 一、安装  serverless 框架

```
npm install -g serverless
```

或者，和我一样使用：

```
yarn global add serverless
```

### 二、设置 aws 凭证。

1.登录 AWS 账号，然后点击进入 IAM  (即，Identity & Access Management)。

2.点击用户，然后添加用户，如 serveless-admin，并在『选择 AWS 访问类型』里，勾上**编程访问**。

![编程访问 serverless](images/enable-programming.png)

3.点击**下一步权限**，选择『直接附加现有策略』，输入**AdministratorAccess**，然后创建用户。

``注意``：由于是 **AdministratorAccess** 权限，所以不要泄漏你的密钥出去。

4. 创建用户。随后，会生成**访问密钥 ID** 和 **私有访问密钥**。请妥善保存好。

然后导出证书，并使用 ``serverless depoy`` 保存到本地。

```
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>

serverless deploy
```

将会自动生成配置到 ~/.aws/credentials

或者，如官方的示例：

```
serverless config credentials --provider aws --key AKIAIOSFODNN7EXAMPLE --secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 三、创建 hello-world 服务

```
serverless create --template aws-nodejs --path hello-world
```

```
Serverless: Generating boilerplate...
Serverless: Generating boilerplate in "/Users/fdhuang/learing/serverless-guide/hello-world"
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.23.0
 -------'

Serverless: Successfully generated boilerplate for template: "aws-nodejs"
(play-env)
```

生成两个文件；

```
├── handler.js
└── serverless.yml
```

其中的 handler.js 的内容是：

```
'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
```

而 ``serverless.yml`` 的内容，因为注释所有的内容，因此相当于是空的。

### 四、部署及测试：

```
$serverless deploy -v
```

日志如下：

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (409 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
CloudFormation - UPDATE_IN_PROGRESS - AWS::CloudFormation::Stack - hello-world-dev
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_COMPLETE - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_COMPLETE - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - HelloLambdaVersionPSzzisjnTvvYknuXwQOlAvdkQZ67qXYSvgoAi9T8W0
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - HelloLambdaVersionPSzzisjnTvvYknuXwQOlAvdkQZ67qXYSvgoAi9T8W0
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Version - HelloLambdaVersionPSzzisjnTvvYknuXwQOlAvdkQZ67qXYSvgoAi9T8W0
CloudFormation - UPDATE_COMPLETE_CLEANUP_IN_PROGRESS - AWS::CloudFormation::Stack - hello-world-dev
CloudFormation - UPDATE_COMPLETE - AWS::CloudFormation::Stack - hello-world-dev
Serverless: Stack update finished...
Service Information
service: hello-world
stage: dev
region: us-east-1
stack: hello-world-dev
api keys:
  None
endpoints:
  None
functions:
  hello: hello-world-dev-hello

Stack Outputs
HelloLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:706605665335:function:hello-world-dev-hello:1
ServerlessDeploymentBucketName: hello-world-dev-serverlessdeploymentbucket-bk066p5c9zgl
```

然后，让我们来触发一下这个函数：

```
$ serverless invoke -f hello -l
```

服务器返回了下面的结果：

```
{
    "statusCode": 200,
    "body": "{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":{}}"
}
--------------------------------------------------------------------
START RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d Version: $LATEST
END RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d
REPORT RequestId: 041138f9-bc81-11e7-aa63-0dbab83f773d	Duration: 2.49 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 20 MB
```

这意味着，我们的第一个服务已经成功上线了。

我们也可以通过下面的命令来获取相应的日志：

```
serverless logs -f hello -t
```

AWS Lambda 动态编程返回 HTML
===

原文链接：[Serverless 应用开发指南： Node.js 编程返回动态 HTML](https://www.phodal.com/blog/serverless-development-guide-nodejs-create-dymamic-html/)


在我们进行 Serverless + SPA 应用开发之前，先看看官方的相应 DEMO。


```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-serve-dynamic-html-via-http-endpoint -n node-serve-html
```

然后执行部署

```
serverless deploy
```

``serverless.yml`` 文件，如下：

```
service: node-serve-html

provider:
  name: aws
  runtime: nodejs4.3

functions:
  landingPage:
    handler: handler.landingPage
    events:
      - http:
          method: get
          path: landing-page
```          

对应的，我们的 ``handler.js`` 文件：


```
'use strict';

module.exports.landingPage = (event, context, callback) => {
  let dynamicHtml = '<p>Hey Unknown!</p>';
  // check for GET params and use if available
  if (event.queryStringParameters && event.queryStringParameters.name) {
    dynamicHtml = `<p>Hey ${event.queryStringParameters.name}!</p>`;
  }

  const html = `
  <html>
    <style>
      h1 { color: #73757d; }
    </style>
    <body>
      <h1>Landing Page</h1>
      ${dynamicHtml}
    </body>
  </html>`;

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };

  // callback is sending HTML back
  callback(null, response);
};
```

上面的代码所做的就是，当我们对 ``landing-page`` 发出请求的时候，便执行上面的 ``landingPage`` 代码。然后返回对应的 HTML body、statusCode、headers。

相应的部署日志如下：

```
..............................
Serverless: Stack update finished...
Service Information
service: node-serve-html
stage: dev
region: us-east-1
stack: node-serve-html-dev
api keys:
  None
endpoints:
  GET - https://uocym5fe3m.execute-api.us-east-1.amazonaws.com/dev/landing-page
functions:
  landingPage: node-serve-html-dev-landingPage
```

然后我们访问：[https://uocym5fe3m.execute-api.us-east-1.amazonaws.com/dev/landing-page](https://uocym5fe3m.execute-api.us-east-1.amazonaws.com/dev/landing-page?name=phodal)，就会返回对应的 HTML，即：

```
Landing Page

Hey phodal!
```

将网站部署到 S3 上
===

原文链接：[Serverless 应用开发指南：使用 S3 部署静态网站](https://www.phodal.com/blog/serverless-development-guide-use-serverless-finch-deploy-s3-static-html/)

在尝试了使用 Router53 路由到 S3 后，并想试试能否使用 serverless 框架来上传静态内容。在探索官方的 DEMO 后，找到了一个 ``serverless-finch`` 插件可以做相应的事情。

```
serverless create --template aws-nodejs s3-static-file s3-static-file
```

配置 serverless-finch
---

官网的 ``serverless-client-s3`` 已经停止维护了，并推荐使用 ``serverless-finch``。

``serverless-finch`` 的安装方式是：

```
npm install --save serverless-finch
```

默认的官网生成的项目，并没有 ``package.json`` 文件，需要手动执行 ``npm inti``，再安装插件。

因此修改完后的 ``package.json`` 文件如下所示：

```
{
  "name": "s3-static-file",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Phodal Huang",
  "license": "MIT",
  "dependencies": {
    "serverless-finch": "^1.1.1"
  }
}
```

在这个时候，我们需要按 serverless 框架的插件要求，添加如下的内容：

```
plugins:
  - serverless-finch
```

并配置好我们的 S3 存储桶的名字，最后 ``serverless.yml`` 文件的内容如下所示：

```
service: s3-static-file


plugins:
  - serverless-finch

provider:
  name: aws
  runtime: nodejs6.10

custom:
  client:
    bucketName: wdsm.io
```

我们配置的 S3 存储桶的名字是: **wdsm.io**，然后其使用 ``client/dist`` 文件来放置静态文件。

静态内容
---

如我们的 ``index.html`` 文件的路径是： ``client/dist/index.html``，对应的内容是：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WDSM.io</title>
</head>
<body>
 	<h1>WDSM</h1>
</body>
</html>
```

最后，执行 ``serverless client deploy`` 就可以部署我们的网站。

``再次提醒``，这次我们用的是 ``serverless client deploy``。

相应的过程日志如下所示：

```
Serverless: Deploying client to stage "dev" in region "us-east-1"...
Serverless: Bucket wdsm.io exists
Serverless: Listing objects in bucket wdsm.io...
Serverless: Deleting all objects from bucket wdsm.io...
Serverless: Configuring website bucket wdsm.io...
Serverless: Configuring policy for bucket wdsm.io...
Serverless: Configuring CORS policy for bucket wdsm.io...
Serverless: Uploading file error.html to bucket wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/wdsm.io/error.html
Serverless: Uploading file index.html to bucket wdsm.io...
Serverless: If successful this should be deployed at: https://s3.amazonaws.com/wdsm.io/index.html
```

由于配置了 Router53 指向了 S3，因此可以直接访问：[http://wdsm.io/](http://wdsm.io/) 来看最后的内容。

并且，对应的删除命令也变成了：``serverless client remove``。



为基于 S3 的网站支持 CRUD
===

原文链接：[Serverless 应用开发指南：API Gateway + S3 + AWS Lambda 打造 CRUD](https://www.phodal.com/blog/serverless-development-guide-use-s3-api-gateway-create-crud/)

在前两篇文章《Serverless 应用开发指南： serverless 的 hello, world》和 《[Serverless 开发指南：AWS IoT 服务开发](https://www.phodal.com/blog/serverless-guide-development-aws-iot-serverless-example/)》 里，我们简单地介绍了如何用 Serverless 和 AWS IoT 开发入门级的 Serverless 应用。

在这一篇文章里，我们将开始进入正式的应用开发领域里：一个 CRUD 示例。

原先，我考虑直接先使用 DynamoDB 进行实验，但是考虑到我之前误用 DynamoDB 被扣 500 刀，再追回来的经历。我决定先用 S3 练练手——主要是已经有一个成型的 DEMO。


概念：API Gateway 与 S3 
---

以下是来自官网对于 API Gateway 和 S3 的介绍：

> Amazon API Gateway 是一种完全托管的服务，可以帮助开发者轻松创建、发布、维护、监控和保护任意规模的 API。只需在 AWS 管理控制台中点击几下，您便可以创建可充当应用程序“前门”的 API，从后端服务访问数据、业务逻辑或功能，例如基于 Amazon Elastic Compute Cloud (Amazon EC2) 运行的工作负载、基于 AWS Lambda 运行的代码或任意 Web 应用。Amazon API Gateway 负责管理所有任务，涉及接受和处理成千上万个并发 API 调用，包括流量管理、授权和访问控制、监控以及 API 版本管理。Amazon API Gateway 没有最低费用或启动成本，您只需为收到的 API 调用和传输出去的数据量付费。

> Amazon S3 将数据作为对象存储在被称为“存储桶”的资源中。您可以在一个存储桶中尽可能多地存储对象，并写入、读取和删除您的存储桶中的对象。对象大小最多可为 5 TB。


简单地来说，API Gateway 就是那个 API gateway，即所有 API 请求的入口。而 S3 就存储内容的部分——可以视作为云盘。

基于 S3 的 Serverless CRUD
---

为了使用 S3，我们需要引入 aws-sdk 库来帮助我们更好的编写 AWS 应用。接着，让我们引入这个服务：

```
serverless install --url https://github.com/tscanlin/serverless-s3-crud
```

然后，到目录中，安装依赖：

```
cd serverless-s3-crud
npm install
```

再执行部署：

```
serverless deploy
```

执行的时候，发现了：

```
  Serverless Error ---------------------------------------

  An error occurred: MyBucket - form-response already exists.

  Get Support --------------------------------------------
     Docs:          docs.serverless.com
     Bugs:          github.com/serverless/serverless/issues
     Forums:        forum.serverless.com
     Chat:          gitter.im/serverless/serverless

  Your Environment Information -----------------------------
     OS:                     darwin
     Node Version:           6.11.0
     Serverless Version:     1.23.0
```

啊哈，这个 MyBucket 已经存在了，这意味着，我们需要改一个新的名字。打开 ``serverless.yml`` 文件，将其中的 16、22、72 行中的 from-response 改成你想要的名字，如 ``phodal-serverless``。

以及** handlers 目录下的各个文件的 Bucket 名**。

serverless.yml 代码中的 ``iamRoleStatements`` 用于设置 serverless 的权限，Action 代码其所能进行的操作，Resource 则是相应的资源：

```
  iamRoleStatements:
    - Effect: Allow
      Action:
        - s3:ListBucket
      Resource: "arn:aws:s3:::phodal-serverless"
    - Effect: Allow
      Action:
        - s3:PutObject
        - s3:GetObject
        - s3:DeleteObject
      Resource: "arn:aws:s3:::phodal-serverless/*"
```

下面的代码则定义了，我们的资源，所使用的存储桶（BucketName）的名字：

```
resources:
  Resources:
    MyBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: phodal-serverless
        AccessControl: PublicReadWrite
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: error.html
```

然后再执行 ``serverless deploy``，就会返回我们想要的结果及 API 地址：

```
api keys:
  None
endpoints:
  POST - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
  GET - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response
  GET - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/readAll
  GET - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
  PUT - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
  DELETE - https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/{id}
functions:
  create: serverless-crud-s3-dev-create
  list: serverless-crud-s3-dev-list
  readAll: serverless-crud-s3-dev-readAll
  readOne: serverless-crud-s3-dev-readOne
  update: serverless-crud-s3-dev-update
  delete: serverless-crud-s3-dev-delete
```

上面列出了所有端口的 API 地址，

上传原理
---


那么，它是怎么进行操作的呢，先看看 ``serverless.yml`` 文件中定义的 create 动作。

```
functions:
  create:
    handler: handler.create
    events:
      - http:
          path: form-response/{id}
          method: post
          cors: true
```

对应了 ``handler.js`` 文件中的 create 方法：

```
const Create = require('./handlers/create.js')
...

function makeResponse(error, result) {
  const statusCode = error && error.statusCode || 200
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify(result),
  }
}

exports.create = (event, context, callback) => {
  Create(event, (error, result) => {
    const response = makeResponse(error, result)
    context.succeed(response)
  })
}
```

对应的 create 操作，即是：

```
'use strict'

const AWS = require('aws-sdk')
const S3 = new AWS.S3(require('../s3config.js')())

module.exports = (event, callback) => {
  S3.upload({
    Bucket: 'phodal-serverless',
    Key: event.pathParameters.id,
    Body: event.body,
    // ACL: 'public-read-write' // TODO: Make this an option.
  }, (err, res) => {
    console.log(err, res)
    callback(err, res)
  })
}
```

我们就是在这里上传数据到 S3 的。

Serverless S3 CRUD 示例
---

一个简单的方式是使用 curl：

```
curl -X POST https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response/1 --data '{ "body" : "Learn Serverless" }'
```

```
{
    "ETag": "\"695827e7012d367b7e7a28a3fdf7ce06\"",
    "Location": "http://s3.amazonaws.com/phodal-serverless/1",
    "key": "1",
    "Key": "1",
    "Bucket": "phodal-serverless"
}
```

然后同样的可以通过 curl 来获取：

```
curl https://xc1iprfbsg.execute-api.us-east-1.amazonaws.com/dev/form-response
```

就是这么简单。

如果只是测试用途，可以在执行完成后执行 serverless remove 来删除对应的服务，以减少开支。

结合 DynamoDB 数据库创建 RESTful API
===

原文链接：[Serverless 应用开发指南：Lambda + API Gateway + DynamoDB 制作 REST API](https://www.phodal.com/blog/serverless-developement-gui-lambda-api-gateway-dynamodb-create-restful-services/)

本文将介绍如何用 AWS Lambda + API Gateway + DynamoDB 创建一个 RESTful API 的示例。文中的示例是一个 TODO API 的示例，支持 GET、POST、PUT、DELETE 请求，即常规的 CRUD。


安装示例项目的命令如下：

```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-rest-api-with-dynamodb -n aws-node-rest-api-with-dynamodb
```

Serverless DynamoDB 示例配置
---

先让我们来看看 ``serverless.yml`` 中的几个重要部分。以下是项目及 dynamodb 的一些相应的配置：

```
provider:
  name: aws
  runtime: nodejs4.3
  environment:
    DYNAMODB_TABLE: ${self:service}-${opt:stage, self:provider.stage}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"
```

即我们配置了我们能用 dynamodb 所进行的操作。

在 functions 字段里，仍然是对应事件的处理。唯一不同的是，这次多了一个 ``cors`` 为 ture 的键值，如其字面意思：允许跨域请求。

```
functions:
  create:
    handler: todos/create.create
    events:
      - http:
          path: todos
          method: post
          cors: true
```          

相应的和之前的 s3 示例一样，也是对相应的资源进行配置，如表名，Scheme 等等。

```
resources:
  Resources:
    TodosDynamoDbTable:
      Type: 'AWS::DynamoDB::Table'
      DeletionPolicy: Retain
      Properties:
        AttributeDefinitions:
          -
            AttributeName: id
            AttributeType: S
        KeySchema:
          -
            AttributeName: id
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
```

Serverless DynamoDB 示例代码
---

接着，让我们来看看一下简单的 ``get`` 操作的例子：

```
'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
```

在代码里，首先我们引入了 aws-sdk，然后创建了一个 DynamoDB 客户端。在 get 函数里，我们将从 ``event`` 对象中获取到路径参数，并取出其中的 id。随后，到数据库中查找是否有相应的 id。

 - 如果有，就返回 200 及对应的内容。
 - 如果没有，则返回一个 501 异常。

除了 create.js 方法中，使用了 uuid 用来生成唯一的 ID。考虑到其它代码与我们正常的 CRUD 并没有多大不同，就不详细展开了。

Serverless DynamoDB 部署
---

```
npm install
```


```
serverless deploy
```

生成的对应数据如下：

```
......................................................................................................
Serverless: Stack update finished...
Service Information
service: serverless-rest-api-with-dynamodb
stage: dev
region: us-east-1
stack: serverless-rest-api-with-dynamodb-dev
api keys:
  None
endpoints:
  POST - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  PUT - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  DELETE - https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
functions:
  create: serverless-rest-api-with-dynamodb-dev-create
  list: serverless-rest-api-with-dynamodb-dev-list
  get: serverless-rest-api-with-dynamodb-dev-get
  update: serverless-rest-api-with-dynamodb-dev-update
  delete: serverless-rest-api-with-dynamodb-dev-delete
```

Serverless DynamoDB 测试
---

我们使用的测试脚本仍然和之前的一样，也相当的简单。以下是创建的命令：

```
curl -X POST https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "Learn Serverless" }'
```

生成的数据如下：

```
{
 "id": "bc74f220-bcb6-11e7-ada2-5b0b42425b91",
 "text": "Learn Serverless",
 "checked": false,
 "createdAt": 1509287868994,
 "updatedAt": 15092878689![94
}][1]
```

让我们再创建一条：

```
 curl -X POST https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "update totdolists" }'
```

这些都可以在数据库中，查看到对应的数据，如下所示：

![DynamoDB 示例](images/dynamodb-console-log.png)

其它操作
---

然后查看所有的：

```
curl https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos
```

或者更新某一条：

```
curl -X PUT https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/1 --data '{ "text": "Learn Serverless", "checked": true }'
```

删除某一条:

```
curl -X DELETE https://dw5y1epmsj.execute-api.us-east-1.amazonaws.com/dev/todos/1
```

对了，没事得删除。。。考虑到我之前的 500 刀的经历，记得：

```
serverless remove
```

Express 实现 Serverless 的 React 服务端渲染
===

原文链接：[Serverless 应用开发指南：Serverless + Express 的 React 服务端渲染](https://www.phodal.com/blog/serverless-development-guide-express-react-build-server-side-rendering/)  

我们已经可以用 AWS Lambda 来动态返回 HTML 了。在阅读了一系列的文章后，也发现了 Express 可以在 Lambda 上运行。当我们可以运行 Express 的时候，也意味着，它可以进行服务端渲染，即我们可以做  React 的服务端渲染。

于是，便有了这篇文章，也有了我创建的第一个 serverless 的项目：[serverless-react-server-side-render](https://github.com/phodal/serverless-react-server-side-render)。

对于这个项目来说，主要分成了三个步骤：

 - 在 AWS Lambda 上运行 Express
 - Express + React 进行服务端渲染
 - 配置 Webpack 来打包 React

Serverless + Express
---

要 AWS Lambda 上运行 Express，其实也是很简单的，按官方的 DEMO 来。

最先我尝试的是 Serverless Frameworks 官方提供的 Express 应用的示例代码：

```
// index.js

const serverless = require('serverless-http');
const express = require('express')
const app = express()

app.get('/', function (req, res) {
      res.send('Hello World!')
})

module.exports.handler = serverless(app);
```

但是这个示例有一个小问题，即我不能在本地运行我的 Express 应用。在探索的时候，我找到了 AWS Lab 提供的 ``aws-serverless-express`` 库。这个库的用法如下：

```
// index.js

const express = require('express')
const app = express()

app.get('/', function (req, res) {
      res.send('Hello World!')
})

app.listen(8080);
module.exports = app;
```

对应的，我们就可以抽象出调用 ``lambdal`` 函数。

```
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./index')
const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {
   console.log("EVENT: " + JSON.stringify(event));
   awsServerlessExpress.proxy(server, event, context)
}
```

那么，我们的 ``serverless.yml`` 就很简单了：

```
service: serverless-react-boilerplate

provider:
  name: aws
  runtime: nodejs6.10
  stage: dev
  region: us-east-1

functions:
  lambda:
    handler: lambda.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

记得在你的 ``package.json`` 中添加以下的内容：

```
 "dependencies": {
    "aws-serverless-express": "^3.0.2",
    "express": "^4.16.2"
}
```

然后，就可以愉快地执行 ``serverless deploy`` 了。

下一步，就是引入 React。


Express + React 进行服务端渲染
---

然后，我开始寻找一个合适的 Serverless 模板，比如：https://github.com/Roilan/react-server-boilerplate。

引入 React 之后， 我们的 ``index.js`` 文件如下所示：

```
const express = require('express')
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app';
import template from './template';

const app = express()

app.get('/', function (req, res) {
	const isMobile = true;
	const initialState = { isMobile };
	const appString = renderToString(<App {...initialState} />);

	res.send(template({
	  body: appString,
	  title: 'Hello World from the server',
	  initialState: JSON.stringify(initialState)
	}));
})

server.listen(8080);
module.exports = app;
```

代码本身是没有什么特别的，对应的 ``webpack.config.js`` 也稍微做了一些变化，即要打包的代码指向了我们的 ``lambda.js`` 文件。

```
module.exports = [
  {
    entry: './src/lambda.js',
    output: {
      path: './dist',
      filename: 'lambda.js',
      libraryTarget: 'commonjs2',
      publicPath: '/'
    },
    target: 'node',
...
```

同样的，对于我们的 ``serverless.yml`` 文件来，调用的路径也变了——使用打包后的 lambda 文件。

```

functions:
  lambda:
    handler: dist/lambda.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

其它代码没有太大的差异。

随后，我们就可以进行我们的第二次部署了：``serverless deploy``。

```
..............
Serverless: Stack update finished...
Serverless: Invoke aws:info
Service Information
service: serverless-react-boilerplate
stage: dev
region: us-east-1
stack: serverless-react-boilerplate-dev
api keys:
  None
endpoints:
  ANY - https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  lambda: serverless-react-boilerplate-dev-lambda
Serverless: Invoke aws:deploy:finalize
```

最后访问 [https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev](https://qdt3kt80x3.execute-api.us-east-1.amazonaws.com/dev) 就可以读取到返回的 HTML，如：

```
<!DOCTYPE html>
<html>
  <head>
    <script>window.__APP_INITIAL_STATE__ = {"isMobile":true}</script>
    <title>Hello World from the server</title>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  
  <body>
    <div id="root"><div data-reactroot="" data-reactid="1" data-react-checksum="-526830126"><h1 data-reactid="2"><!-- react-text: 3 -->hello world <!-- /react-text --><!-- react-text: 4 -->mobile<!-- /react-text --></h1></div></div>
  </body>
  
  <script src="/assets/bundle.js"></script>
</html>
```

结果看上去，有点不如我们的预期，显示的内容是『hello world mobile』。不过，至少代表了我们的代码是 work 的。

从目前的情况来看，仍然有很大的改进空间，如 webpack 版本过低、React 使用的是 15.6.2。但是 it works。

末了，记得使用 ``serverless remove`` 来省点钱。

Serverless 的微信公共平台后台
===

原文链接：[Serverless 应用开发指南：基于 Serverless 与 Lambda 的微信公共平台](https://www.phodal.com/blog/serverless-development-guide-serverless-lambda-wechat-public-platform/)

Serverless 在事件驱动方面具有天然的优势，其中之一就是聊天机器人。可要做聊天机器人不是一件容易的事，微信和 QQ 都只能用 Hack 的方式进行。

于是，便想到微信公众号是不是一个更好的选择。当用户输入一个关键词时，做出相应的回复。总体上来说，他们之间是差不多的。这个时候，就可以开始尝试一个在线上运行的 Serverless 服务。

在这件事上，有这么几个步骤：

 - 创建 Serverless  服务
 - 引入 node-wechat
 - 配置 APP_ID 和 TOKEN 等 
 - 配置 Route 53 与 API Gateway
 - 添加微信公众平号服务
 - 部署

创建 Serverless  服务
---

首先，让我们创建我们的服务：

```
serverless create --template aws-nodejs --path serverless-wechat
```

这个步骤依旧是这么的简单。

引入 node-wechat
---

然后我找到了 node-wechat 库，它使用 express 来做路由，示例如下：

```
const express = require('express');
const app = express();
var wechat = require('wechat');
var config = {
  token: 'token',
  appid: 'appid',
  encodingAESKey: 'encodinAESKey',
  checkSignature: true // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

app.use(express.query());
app.use('/wechat', wechat(config, function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  if (message.FromUserName === 'diaosi') {
    // 回复屌丝(普通回复)
    res.reply('hehe');
  }
}));
```  

上面便是我们的 ``index.js`` 文件。

然后就是使用类似于《[Serverless 应用开发指南：Serverless + Express 的 React 服务端渲染](https://www.phodal.com/blog/serverless-development-guide-express-react-build-server-side-rendering/)》中的方法，使用 ``aws-serverless-express`` 来做出一层代理：

```
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./index');
const server = awsServerlessExpress.createServer(app);

exports.runserver = (event, context) => {
   console.log("EVENT: " + JSON.stringify(event));
   awsServerlessExpress.proxy(server, event, context)
}
```

接下来就是进行相关的配置。

配置 APP_ID 和 TOKEN 等 
---

首先，修改我们的 ``index.js`` 文件中的配置相关代码：

```
let config = {
  token: process.env.TOKEN,
  appid: process.env.APP_ID,
  encodingAESKey: process.env.AESKey,
  checkSignature: true
};
```

token、id、encodingAESKey 将从 ``serverless.yml`` 文件中读取。我们的 ``serverless.yml`` 文件将从另外的文件中读取：

```

functions:
  runserver:
    handler: handler.runserver
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
    environment:
      TOKEN: ${file(./config.yml):TOKEN}
      APP_ID: ${file(./config.yml):APP_ID}
      AESKey: ${file(./config.yml):AESKey}
```

即从 ``config.yml`` 中读取：

```
TOKEN: TOKEN
APP_ID: APP_ID
AESKey: AESKey
```

这是为了确保我们可以保护密钥的安全。

一切准备就绪，执行：

```
serverless deploy
```

就会生成对应的 API：

```
stack: serverless-wechat-dev
api keys:
  None
endpoints:
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  runserver: serverless-wechat-dev-runserver
```

于是，我将这个地址填到了公众号后台，发现公号不支持 API Gateway。只能想办法使用自定义的域名，随后就需要使用 Route 53 来创建了。

配置 Route 53 与 API Gateway
---

如之前在《[Serverless 应用开发指南： API Gateway 与 Route53 自定义域名](https://www.phodal.com/blog/serverless-development-guide-api-gateway-and-route53-custom-domain/)》中所说，按下面的步骤就可以配置 Route 53 了。

在 Route 53 上注册有域名，如果没有的话，需要转到 Route 53。

然后，才能为你的域名请求一个证书

需要选择的区域是 ``us-east-1``，这个 region 才能与 API Gateway 一起工作。

在这个过程中，需要验证域名的所有权。所以，你需要先找个地方注册域名邮箱，如我使用的是网易的域名邮箱。

```
$ yarn add --dev serverless-domain-manager
```

或者

```
$ npm install serverless-domain-manager --save-dev
```

```
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: wechat.wdsm.io
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
```

```
serverless create_domain
```

日志：


```
Serverless: Domain was created, may take up to 40 mins to be initialized.
```

AWS CLI 查看：

```
{
    "items": [
        {
            "certificateArn": "arn:aws:acm:us-east-1:706605665335:certificate/278c252a-7aaf-41df-bcf1-adc279347557",
            "distributionDomainName": "d1pp7oijqquj95.cloudfront.net",
            "certificateUploadDate": 1509592737,
            "domainName": "wechat.wdsm.io"
        }
    ]
}
```

现在，再执行 ``serverless deploy`` 就可以完成整个步骤了。

添加微信公众平号服务
---

然后，我们可以创建几个简单的服务，比如从 Google 搜索内容：

```
google(keyword, function (err, res) {
  let result = R.map(R.compose(updateItemField, R.values, R.pick(['title', 'link'])))(res.links);
  response.reply('你想要在 Google 上搜索的内容有： ' + result);
});
```

又或者是，搜索我博客的相关内容：

```
request.get('https://www.phodal.com/api/app/blog_detail/?search=' + keyword, {
  headers: {
    'User-Agent': 'google'
  }
}, function (error, res, body) {
  if (res.statusCode === 200) {
    let parsed = JSON.parse(body);
    const data = parsed;
    var result = R.map(R.compose(updatePhodalItemField, R.values, R.pick(['title', 'slug'])))(data);
    response.reply({
      content: '在『 phodal.com 』上有 x 个结果，前 10 个如下：' + result,
      type: 'text'
    });
  }
});
```

最后代码见：[https://github.com/phodal/mp/blob/master/index.js](https://github.com/phodal/mp/blob/master/index.js)

部署
---

最后，让我们愉快地执行 ``serverless deploy``，对应的日志如下：

```
stack: serverless-wechat-dev
api keys:
  None
endpoints:
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://e8tct5f0v2.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  runserver: serverless-wechat-dev-runserver
Serverless Domain Manager Summary
Domain Name
  wechat.wdsm.io
Distribution Domain Name
  d1pp7oijqquj95.cloudfront.net
```

结果你想用这个服务，那么只需要：

```
serverless install -u https://github.com/phodal/mp -mp
```

执行：

```
yarn install
```

再创建你的 ``config.yml`` 文件：

```
cp config.yml.template config.yml
```

最后，就可以愉快地部署了。

如果你是为测试，你可以执行 ``serverless remove`` 来删除服务。

最后效果见我的微信公众号：phodal-weixin

![微信](images/phodal-wechat.jpg)

基于 Kinesis Streams 的数据流分析
===

Serverless 适合用于事件驱动型应用，以及定时任务。今天，让我们来看看一个事件驱动的例子。

在之前的那篇《[Serverless 应用开发指南：CRON 定时执行 Lambda 任务](https://www.phodal.com/blog/serverless-development-guide-cron-scheduled-job/)》中，我们介绍了如何调度的示例。

最初我想的是通过 Lambda + DynamoDB 来自定义数据格式，后来发现使用 Kinesis Streams 是一种更简单的方案。

Amazon Kinesis Streams
---

今天，我们要学习的组件是 Amazon Kinesis Streams。引自官网的介绍：

> 借助 Amazon Kinesis Streams，您可以构建用于处理或分析流数据的自定义应用程序，以满足特定需求。Kinesis Streams 每小时可从数十万种来源 (如网站点击流、财务交易、社交媒体源、IT 日志和定位追踪事件) 中持续捕获和存储数 TB 数据。借助 Kinesis Client Library (KCL)，您可以构建 Amazon Kinesis 应用程序，并能使用流数据为实时控制面板提供强力支持、生成警报、实施动态定价和广告等等。您还可以将数据从 Kinesis Streams 发送到其他 AWS 服务中，如 Amazon Simple Storage Service (Amazon S3)、Amazon Redshift、Amazon EMR 和 AWS Lambda。

简单的来说，用于收集日志事件数据的功能，还可以用于实时数据分析。

Serverless + Kinesis Streams
---

最初我试用了 GitHub 上的[serverless-kinesis-streams](https://github.com/pmuens/serverless-kinesis-streams)，然后发现它并不会自动创建 Kinesis Streams 服务，于是便自己创建了一个：

```
serverless install -u https://github.com/phodal/serverless-guide/tree/master/kinesis-streams -n kinesis-streams                                10:14:50
Serverless: Downloading and installing "serverless-kinesis-streams"...
central entry: serverless-kinesis-streams-master/
central entry: serverless-kinesis-streams-master/README.md
central entry: serverless-kinesis-streams-master/event.json
central entry: serverless-kinesis-streams-master/handler.js
central entry: serverless-kinesis-streams-master/package.json
central entry: serverless-kinesis-streams-master/serverless.yml
Serverless: Successfully installed "serverless-kinesis-streams" as "kinesis-streams"
```

然后执行：

```
yarn install
```

就可以直接部署了：

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (19.75 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............................
Serverless: Stack update finished...
Service Information
service: kinesis-streams
stage: dev
region: us-east-1
stack: kinesis-streams-dev
api keys:
  None
endpoints:
  None
functions:
  dataReceiver: kinesis-streams-dev-dataReceiver
  logger: kinesis-streams-dev-logger
Serverless: Removing old service versions...
```

完成后，就可以测试一下了。

```
$ serverless invoke --function dataReceiver --path event.json                                                                

11:30:48
{
    "message": "Data successfully written to Kinesis stream \"data-receiver\""
}
```

然后，通过相应的日志，我们就可以看到数据流向了：Kinesis stream 

```
$ serverless logs --function logger                                                                                          

11:31:41
START RequestId: 3776bac6-612f-45dd-a8ac-156007f8e49b Version: $LATEST
2017-11-04 11:30:53.382 (+08:00)  3776bac6-612f-45dd-a8ac-156007f8e49b  The following data was written to the Kinesis stream "data-receiver":
{
  "kinesisSchemaVersion": "1.0",
  "partitionKey": "8e35d6a0-c110-11e7-90ae-59fa1aa30da7",
  "sequenceNumber": "49578559262872379484471662829472308063624661238972153858",
  "data": "U29tZSBleGFtcGxlIGRhdGE=",
  "approximateArrivalTimestamp": 1509766251.753
}
END RequestId: 3776bac6-612f-45dd-a8ac-156007f8e49b
REPORT RequestId: 3776bac6-612f-45dd-a8ac-156007f8e49b  Duration: 72.07 ms  Billed Duration: 100 ms   Memory Size: 128 MB Max Memory Used: 33 MB
```

但是光把数据流向 Kinesis stream ，并没有什么用，我们需要对数据进行处理。比如说，直接将数据存储到 S3，或者是 DynamoDB。

So，请期待我们的下一篇文章。

Serverless 数据分析，Kinesis Firehose 持久化数据到 S3
===

based on:[serverless-kinesis-streams](https://github.com/pmuens/serverless-kinesis-streams), but auto create Kinesis streams

在尝试了使用 Kinesis Stream 处理数据之后，我发现它并不能做什么。接着，便开始找寻其它方式，其中一个就是：Amazon Kinesis Firehose

> Amazon Kinesis Firehose 是将流数据加载到 AWS 的最简单方式。它可以捕捉、转换流数据并将其加载到 Amazon Kinesis Analytics、Amazon S3、Amazon Redshift 和 Amazon Elasticsearch Service，让您可以利用正在使用的现有商业智能工具和仪表板进行近乎实时的分析。这是一项完全托管的服务，可以自动扩展以匹配数据吞吐量，并且无需持续管理。它还可以在加载数据前对其进行批处理、压缩和加密，从而最大程度地减少目的地使用的存储量，同时提高安全性。

Serverless Kinesis Firehose 代码
---

总的来说，Kinesis Firehose 的 Lambda 代码与 Kinesis 是差不多的。

```
module.exports.receiver = (event, context, callback) => {
  const data = event.data;
  const firehose = new AWS.Firehose();

  const params = {
    Record: {
      Data: data
    },
    DeliveryStreamName: 'serverless-firehose'
  };

  return firehose.putRecord(params, (error, data) => {
    ...
};
```

以下则是 Kinesis Stream 的代码：

```
module.exports.dataReceiver = (event, context, callback) => {
  const data = event.data;
  const kinesis = new AWS.Kinesis();
  const partitionKey = uuid.v1();

  const params = {
    Data: data,
    PartitionKey: partitionKey,
    StreamName: 'kinesis-streams-stream'
  };

  return kinesis.putRecord(params, (error, data) => {
    ...
  });
};
```

两个 Lambda 函数之间，最大的区别就是在于 new 出来的对象不一样，并且这个对象的参数也是不一样的。

但是他们的配置来说，可能相差甚远。并且，实际上将数据存到 S3 的工作，主要是由 ``serverless.yml`` 文件来控制 的：

```
ServerlessKinesisFirehoseBucket:
  Type: AWS::S3::Bucket
  DeletionPolicy: Retain
  Properties:
    BucketName: serverless-firehose-bucket
ServerlessKinesisFirehose:
  Type: AWS::KinesisFirehose::DeliveryStream
  Properties:
    DeliveryStreamName: serverless-firehose
    S3DestinationConfiguration:
      BucketARN:
        Fn::Join:
        - ''
        - - 'arn:aws:s3:::'
          - Ref: ServerlessKinesisFirehoseBucket
      BufferingHints:
        IntervalInSeconds: "60"
        SizeInMBs: "1"
      CompressionFormat: "UNCOMPRESSED"
      Prefix: "raw/"
      RoleARN: { Fn::GetAtt: [ FirehoseToS3Role, Arn ] }
```          

在配置文件中，我们定义了要交付的 Stream 的名字，以及对应用来存储数据的 S3 Bucket 名称。

安装及测试
---

好了，现在不妨直接试试相关的代码。

1.安装我们的服务

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/kinesis-streams -n kinesis-streams
```

2.然后：

```
npm install
```

3.紧接着部署：

```
serverless deploy
```

4.触发我们的函数：

```
serverless invoke --function receiver --path event.json
```

便会在我们的 S3 中生成对应的数据文件：

![Firehose](images/firehose-s3.png)

由于这里的数据太少，就没有用 Kinesis Analytics 进行分析了。

创建邮件发送 API 
===

当你有一个不成熟的 Idea 时，作为一个受精益思想影响的开发者，那么你可能会学习 Dropbox 创建一个 Landing Page 来验证你的想法。如下图所示：

![Launch Page](images/launch-page.jpg)

这个时候，你只需要大胆地公布出你的 Idea。等待用户的到来、在网页上提交他们的邮箱 blabla。然后在产品准备得差不多的时候，就可以大声地告诉全世界，你们可以来试用了。不过，这只里我们只讨论如何来发送邮件。

对于诸如邮件发送、短信发送等服务的业务场景来说，采用 Serverless 特别合适——当然，如果你也使用 AWS 服务就更好了。我们只需要将相关的参数，发送到对应的接口即可。

这次我们要用到的 AWS 服务是 SES（Simple Email Service）。

> Amazon Simple Email Service (Amazon SES) 为基于云端的电子邮件发送服务，旨在帮助数字营销师和应用程序开发师发送营销、通知和业务电子邮件。对于使用电子邮件联系客户的所有规模的企业来说，它是一种可靠且经济实用的服务。

说了这么多，还不如动手操作一下。

Serverless Email 发送
---

笔者创建的服务最初是基于：[AWS-SES-Serverless-Example](https://github.com/lakshmantgld/aws-ses-serverless-example.git)。

好了，下面让我们安装这个 Serverless 服务：

```
serverless install -u https://github.com/phodal/serverless-guide/tree/master/ses -n ses
```

然后执行：

```
yarn install
```

接着复制一份 ``config.copy.json`` 为 ``config.json``，然后在其中配置上相关的内容：

```
{
  "aws": {
    "accessKeyId": "",
    "secretAccessKey": "",
    "region": ""
  }
}
```

就可以愉快地部署了：

```
$ serverless deploy

...
Serverless: Stack update finished...
Serverless: Invoke aws:info
Service Information
service: aws-ses
stage: dev
region: us-east-1
stack: aws-ses-dev
api keys:
  None
endpoints:
  POST - https://474a4mg7a7.execute-api.us-east-1.amazonaws.com/dev/sendMail
functions:
  sendMail: aws-ses-dev-sendMail

Stack Outputs
SendMailLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:706605665335:function:aws-ses-dev-sendMail:1
ServiceEndpoint: https://474a4mg7a7.execute-api.us-east-1.amazonaws.com/dev
ServerlessDeploymentBucketName: aws-ses-dev-serverlessdeploymentbucket-14jvptxerdtxi

Serverless: Invoke aws:deploy:finalize
```

这次的代码也很简单，主要是通过 aws-sdk 中的 SES 来发送邮件：

```
import AWS from 'aws-sdk';
let ses = new AWS.SES();

module.exports.sendMail = (event, context, callback) => {
  ...
  ses.sendEmail(emailParams, function (err, data) {
      if (err) {
          console.log(err, err.stack);
          callback(err);
      } else {
        console.log("SES successful");
        console.log(data);

        callback(null, response);
      }
  });
}
```

代码中便是直接调用相关的参数的。

接下来就是测试时间了。

Serverless Email 发送测试
---

我按照项目的参数配置：

```
{
    "bccEmailAddresses": [],
    "ccEmailAddresses": [],
    "toEmailAddresses": ["xxx@qq.com"],
    "bodyData": "Hey test message buddy!! From AWS SES",
    "bodyCharset": "UTF-8",
    "subjectdata": "AWS SES",
    "subjectCharset": "UTF-8",
    "sourceEmail": "xxx@qq.com",
    "replyToAddresses": ["xxx@qq.com"]
}
```

在 PostMan 上进行了测试：

![PostMan 示例](images/post-man-example.png)

然后报错了：

```
{
    "errorMessage": "There were 3 validation errors:\n* MissingRequiredParameter: Missing required key 'Source' in params\n* MissingRequiredParameter: Missing required key 'Data' in params.Message.Body.Text\n* MissingRequiredParameter: Missing required key 'Data' in params.Message.Subject",
    "errorType": "MultipleValidationErrors",
    "stackTrace": [
        "* MissingRequiredParameter: Missing required key 'Source' in params",
        "* MissingRequiredParameter: Missing required key 'Data' in params.Message.Body.Text",
        "* MissingRequiredParameter: Missing required key 'Data' in params.Message.Subject",
        "ParamValidator.validate (/var/runtime/node_modules/aws-sdk/lib/param_validator.js:40:28)",
        "Request.VALIDATE_PARAMETERS (/var/runtime/node_modules/aws-sdk/lib/event_listeners.js:125:42)",
        "Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "callNextListener (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:95:12)",
        "/var/runtime/node_modules/aws-sdk/lib/event_listeners.js:85:9",
        "finish (/var/runtime/node_modules/aws-sdk/lib/config.js:315:7)",
        "/var/runtime/node_modules/aws-sdk/lib/config.js:333:9",
        "Credentials.get (/var/runtime/node_modules/aws-sdk/lib/credentials.js:126:7)",
        "getAsyncCredentials (/var/runtime/node_modules/aws-sdk/lib/config.js:327:24)",
        "Config.getCredentials (/var/runtime/node_modules/aws-sdk/lib/config.js:347:9)"
    ]
}
```

后来，才发现 SES 上有一行解释。

> 对于 Amazon SES 新用户 – 如果您尚未申请提高发送限制，则仍将处于沙箱环境中，且只能发送电子邮件至您之前验证过的地址。要验证新电子邮件地址或域，请参阅 Amazon SES 控制台的身份管理部分。

于是便登录 SNS，新增了一个验证邮箱。

试了 gmszone@qq.com 、网易邮箱都不行，最后用了 Google 的。

最后，终于可以接收到邮件了。

[创建自己的 Serverless 短链服务](https://www.phodal.com/blog/serverless-architecture-develoment-create-self-short-url-services/)
===


在想用 Serverless 可以做点什么简单的在线应用后，我想到了一个是在线短链生成服务。最后的结果见：[http://x.pho.im/](http://x.pho.im/)，一个非常简单的在线应用。

这里的代码基于：[https://github.com/vannio/serverless-shrink](https://github.com/vannio/serverless-shrink)。

因为上面的代码中，不能自动创建域名。然后，再针对数据库进行了一些优化。

### 代码逻辑

这里的代码逻辑比如简单：

 - 创建短链时，使用生成一个四位的字符串
 - 将原有的 URL 和生成的 URL 存储到 DynamoDB 中
 - 在返回的 HTML 中，输出对应的 URL
 - 重定向时，从 DynamoDB 读取对应的短链
 - 如果短链存在，则执行 302 重定向；如果不存在，则返回一个 404。

创建首页
---

首页只是一个简单的 HTML 表单：

```
const base_page = `<html>
<h1>Hi!</h1>
  <form method="POST" action="">
    <label for="uri">Link:</label>
    <input type="text" id="link" name="link" size="40" autofocus />
    <br/>
    <br/>
    <input type="submit" value="Shorten it!" />
  </form>
</html>`

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));

  callback(
    null,
    {
      statusCode: 200,
      body: base_page,
      headers: {'Content-Type': 'text/html'},
    }
  );
}
```

当我们提交的时候，就会触发对应的 POST 请求。

生成短链
---

如上所述，对于个短链请求，我们要做这么几件事：

1. 解析出提交表单中的链接
2. 根据 URL 生成对应的短链
3. 将对应的 URL 和短链的对应关系存储到 DynamoDB 中
4. 如果成功，则返回生成的短链；失败则，返回一个 400

事实上，在存储 URL 和短链的 map 之前，我们应该先判断一下数据中是否已经有相应的短链。不过，对于这种只针对于我一个用户的短链服务来说，这个步骤有点浪费钱——毕竟要去扫描一遍数据库。所以，我也不想去添加这样的扩展功能。

接下来，让我们回到代码中去，代码的主要逻辑都是在 Promise 里，按顺序往下执行。

### 解析出提交表单中的链接

首先，我们通过 ``querystring`` 库来解决中表单中的链接。

```
const submitted = querystring.parse(event.body).link;
```

### 根据 URL 生成对应的短链

接着，使用 Node.js 中的 ``crypto.randomBytes`` 方法来生成八位的伪随机码。

```
crypto.randomBytes(8)
  .toString('base64')
  .replace(/[=+/]/g, '')
  .substring(0, 4)
```        

由于生成的伪随机码是 Buffer 类型，因此需要转换为字符串。同时，因为生成的短链中不应该有 "=+/"，它会导致生成的 URL 有异常。于是，我们便替换掉伪随机码中的这些特殊字体。最后，截取生成的字符串的前 4 位。

现在，我们就可以将其存储到数据中了。

### 存储到 Dynamo 数据库中。

对应的存储逻辑如下所示，我们 new 了一个 DocumentClient 对象，然后直接存储到数据库中。``put`` 函数中的对象，即是对应的参数。

```
return docClient.put({
  TableName: tableName,
  Item: {
    slug: slug,
    url: submitted
  },
  Expected: {
    url: {Exists: false}
  }
}).promise().then(() => { return slug; });
```

最后，我们返回了 ``slug``，用于接下来的处理。

### 返回短链给用户

一切处理正常的话，我们将向用户返回最后的内容：


```
return callback(
  null,
  {
    statusCode: 200,
    body: RenderPage(path.join(prefix, slug).replace(':/', '://'), prefix),
    headers: {'Content-Type': 'text/html'}
  }
);
```

其中的 HTML 部分的渲染逻辑如下所示：

```
function RenderPage (link, submitted) {
  return `
<html>
<body>
<h3>
  <a href="${link}">${link}</a>
</h3>
<p>URL ${submitted} was shortened to:
  <a href="${link}">${link}</a>
</p>
</body>
</html>`
};
```

是的，只是返回短链和原有的链接了。

好了，现在我们已经拥有这个短链了。接下来，就是点击这个短链，看看背后会发生些什么？

重定向短链
---

首先，我们先在我们的 ``serverless.yml`` 中，将短链的路径配置为参数：

```
functions :
  ...
  redirect:
    handler: redirect/index.handler
    events:
      - http:
          path: /{slug}
          method: get
```

然后，从数据库中按短链的 slug 查找对应的 URL：

```
const slug = event.pathParameters.slug;

docClient.get({
  TableName: tableName,
  Key: {
    slug: slug
  }
}, (err, data) => {

})
```

如果存在对应的短链，则 302 重定向对原有的 URL：

```
const item = data.Item;

if (item && item.url) {
  callback(
    null,
    {
      statusCode: 302,
      body: item.url,
      headers: {
        'Location': item.url,
        'Content-Type': 'text/plain'
      }
    }
  )
}
```

如果没有，则返回一个 404。

我们的代码就是这么的简单，现在让我们来部署测试一下。

部署及测试短链服务
---

如果你还没有 clone 代码的话，执行下面的命令来安装：

```
serverless install -u https://github.com/phodal/serverless-guide/tree/master/url-shorter -n url-shorter
```

然后执行 ``yarn install`` 来安装对应的依赖。

如果你在 Route53 上注册有相应的域名，修改一下 ``serverless.yml`` 文件中的域名，我们就可以使用 ``serverless create_domain`` 来创建域名的路由。

紧接着，执行 ``serverless deploy`` 来部署。

```
api keys:
  None
endpoints:
  GET - https://4rr5ndhaw3.execute-api.us-east-1.amazonaws.com/dev/
  POST - https://4rr5ndhaw3.execute-api.us-east-1.amazonaws.com/dev/
  GET - https://4rr5ndhaw3.execute-api.us-east-1.amazonaws.com/dev/{slug}
functions:
  main: url-shorter-dev-main
  create: url-shorter-dev-create
  redirect: url-shorter-dev-redirect
Serverless Domain Manager Summary
Domain Name
  x.pho.im
Distribution Domain Name
  d2s4y0p5nuw3k7.cloudfront.net
Serverless: Removing old service versions...
```

一切准备就绪了。

1. 访问 [https://x.pho.im/](https://x.pho.im/)
2. 然后输入一个链接，如：[https://github.com/phodal/serverless-guide](https://github.com/phodal/serverless-guide)
3. 复制生成的地址：[https://x.pho.im/rgQC](https://x.pho.im/rgQC)，并返回
4. 看是否会重定向到我们的网站上。

Done!


结合 Auth0 的登录、授权系统
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

 - auth 函数，用于对用户传过来的 Token 进行校验
 - publicEndpoint 函数，一个公开的 API 结点
 - privateEndpoint 函数，一个需授权才能访问的 API，即它将调用 auth 函数，根据授权结果来返回相应的内容。

更详细的资料，可以访问官方的文档：[使用 API Gateway 自定义授权方](http://docs.aws.amazon.com/zh_cn/apigateway/latest/developerguide/use-custom-authorizer.html)。

auth 函数的代码如下所示：

```
const jwt = require('jsonwebtoken');
...
const jwt = require('jsonwebtoken');
  if (event.authorizationToken) {
    // remove "bearer " from token
    const token = event.authorizationToken.substring(7);
    const options = {
      audience: AUTH0_CLIENT_ID,
    };
    jwt.verify(token, AUTH0_CLIENT_SECRET, options, (err, decoded) => {
      if (err) {
        cb('Unauthorized');
      } else {
        cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
      }
    });
  } else {
    cb('Unauthorized');
  }
};
```  

代码中的主要函数是 ``jwt.verify``，它将根据 AUTH0 的 ID 和密钥来校验 token 是否是有效的。同时，还引用了一个名为 ``generatePolicy`` 的方法：

```
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};
```

这个方法用于生成一个 IAM 的策略，这个策略的生成规则建议参考官方文档，以上的内容和 AWS 的官方 DEMO 是一致的。随后，再根据生成的是 'Allow' 或者 'Deny' 来判断，该用户是否拥有权限。如果用户拥有权限的，那么就会继续往下执行：

```
module.exports.privateEndpoint = (event, context, cb) => {
  cb(null, { message: 'Only logged in users can see this' });
};
```

说了这么多，还是让我们跑跑代码吧。

配置及部署
---

在这一个步骤里我们要做这么几件事：

 - 注册、获取 Auth0 的账号
 - 部署 Lambda 函数，获取后台 API 地址
 - 根据上一步生成的地址，修改前端代码中的地址

因此在开始之前，需要先申请一个 Auth0 的账号，然后在 ``config.yml`` 中，添加 auth0 的 id 和密钥。

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

![Auth GitHub](images/auth0-github-example.png)

接着，点击上面的 GitHub 『！』号，会提示我们填写对应的授权信息。

打开我们的 GitHub ，申请一个新的 OAuth 应用，地址：[https://github.com/settings/applications/new](https://github.com/settings/applications/new)

详细的信息见：[https://auth0.com/docs/github-clientid](https://auth0.com/docs/github-clientid)。

如我的配置是：

```
Homepage URL: https://phodal.auth0.com
Authorization callback URL  https://phodal.auth0.com/login/callback
```

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

![CORS 配置](images/auth0-cors-configure-example.png)

然后，再测试一下登录：

![Auth0 测试登录](images/auth0-login-example.png)

漂亮，我们登录成功了。

### 清理

 - 删除 Auth0 的应用
 - 删除 GitHub 的应用
 - 清空 Bucket：``serverless client remove``
 - 清空 Lambda：``serverless remove``

结论
---

AWS 官方的 Congito 支持的第三方应用有限，在这个时候 Auth0 成了一个更好的选择。除了 GitHub，Auth0 还集成了微博、人人等等的国内的平台。

当然授权，作为一个基础的服务，几乎是每个应用的重要功能，也是核心的功能。对于大数中大型公司来说，几乎不太可能采用这样的方案。

在本地部署与调试
===

在这几周的 Serverless 应用开发里，我觉得最大的不便就是，缺少一个本地的调试环境。在这种时候，我们需要不断地部署我们的代码，不断地在我们的代码里写上几行 ``console.log``，然后在一切正常之后，再把这些 ``console.log`` 删除。

可要是，突然间又出现了一个 bug，我仿佛看到了我们又要重来一遍。

就这样经历了几次之后，我便想尝试一些新的手段，比如 ``serverless-offline``。


serverless-offline
---

serverless-offline 是一个 Serverless Framework 的插件，它可以在本地的机器上模拟 AWS Lamdba 和 API Gateway，以加快开发者的开发周期。为此，它启动一个处理请求生命周期的 HTTP 服务器，就像 APIG 一样，并调用你的处理程序。

及包含以下的特性：

 - 仅支持 Node.js 下的 Lambda 函数
 - 支持 Velocity 模板
 - 延迟加载你的、需要缓存失效文件：而不需要重载工具，如Nodemon。
 - 以及，集成，授权人，代理，超时，responseParameters，HTTPS，Babel 运行时环境，CORS 等...

那么，让我们看看如何做到这一点。

本地搭建 serverless-offline 与 DynamoDB 环境
---

这次我们将基于之前的文章《[Serverless 应用开发指南：Lambda + API Gateway + DynamoDB 制作 REST API
](https://www.phodal.com/blog/serverless-developement-gui-lambda-api-gateway-dynamodb-create-restful-services/)》中的 todolist，来开始我们的调试之旅。

在之前的示例里，我们使用了 DynamoDB 来存储数据。在这篇文章里，我们也将介绍 ``serverless-dynamodb-local`` 来在本地运行 DynamoDB。

在那之前，如果你还没有之前的代码，请先安装服务到本地：

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/aws-node-rest-api-with-dynamodb -n dynamodb-offline
```

然后，在我们的项目里安装 ``serverless-offline`` 插件：

```
yarn add --dev serverless-offline
```

并安装 ``serverless-dynamodb-local`` 插件：

```
yarn add --dev serverless-dynamodb-local
```

然后，在 ``serverless.yml`` 中添加相应的插件：

```
plugins:
  - serverless-offline
  - serverless-dynamodb-local
```

紧接着，还需要进行相应的 dynamodb 配置：

```
custom:
  dynamodb:
    start:
      port: 8000
      inMemory: true
      migrate: true
    migration:
      dir: offline/migrations
```

其中的 migration 对应的是本地的 Scheme，位于 ``offline/migrations/todos.json``，内容如下：

```
{
    "Table": {
        "TableName": "serverless-rest-api-with-dynamodb-dev",
        "KeySchema": [
            {
                "AttributeName": "id",
                "KeyType": "HASH"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "id",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        }
    }
}
```

然后，执行：

```
serverless dynamodb install
```

以安装 DynamnoDB 的本地版本。

一切准备妥当了，我们可以进行测试了。


本地测试 serverless-offline 与 DynamoDB
---

接着，让我们用下面的命令，来运行起本地的环境：

```
$ serverless offline start

Dynamodb Local Started, Visit: http://localhost:8000/shell
Serverless: DynamoDB - created table serverless-rest-api-with-dynamodb-dev
Serverless: Starting Offline: dev/us-east-1.

Serverless: Routes for create:
Serverless: POST /todos

Serverless: Routes for list:
Serverless: GET /todos

Serverless: Routes for get:
Serverless: GET /todos/{id}

Serverless: Routes for update:
Serverless: PUT /todos/{id}

Serverless: Routes for delete:
Serverless: DELETE /todos/{id}

Serverless: Offline listening on http://localhost:3000
```

启动的时候，发现直接报错了：

```
  message: 'Missing region in config',
  code: 'ConfigError',
  time: 2017-11-07T01:18:45.365Z }
```

对比了官方的示例代码后，发现没有对本地调用的 DynamoDB 进行处理：

让我们，新增一个 ``todos/dynamodb.js`` 文件：

```
'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = client;
```

当我们在本地运行的时候，将使用本地的 DynamoDB，当在服务端运行的时候，则会调用真正的 DynamoDB。

再去修改 ``create.js``、``delete.js``、``get.js``、``list.js`` 和 ``update.js`` 中的：

```
const dynamoDb = new AWS.DynamoDB.DocumentClient();
```

改为


```
const dynamoDb = require('./dynamodb');
```

确认一切无误后，我们就可以使用 postman 测试：

![PostMan 测试 Serverless Offline](images/postman-offline-db.png)

或者 curl：

```
curl -X POST -H "Content-Type:application/json" http://localhost:3000/todos --data '{ "text": "Learn Serverless" }'
```

接着打开本地的 todos 地址：

```
http://localhost:3000/todos
```

就会返回类似于在线上生成的数据结果。

```
[{"checked":false,"createdAt":1510018445663,"id":"be15f600-c35b-11e7-8089-a5ea63a20ab5","text":"Learn Serverless","updatedAt":1510018445663}]
```

Awesome！

既然，已经有了可以在本地运行 DynamoDB，那么我们是不是可以写上几个测试呢？

如何编写 Serverless 应用的测试
===

如 Serverless Framework 官方所说

虽然 Serverless 架构在服务业务逻辑方面引入了很多简单性，但是它的一些特性给测试带来了挑战。他们是：

 - Serverless 架构是独立的分布式服务的集成，它们必须被独立地和一起地测试。
 - Serverless 架构依赖于互联网、云服务，这些服务很难在本地模拟。
 - Serverless 架构可以具有事件驱动的异步工作流程，这些工作流程很难完全仿真。

因此官方建议：

 - 编写您的业务逻辑，使其与 FaaS 提供商（例如，AWS Lambda）分开，以保持提供者独立性，可重用性和更易于测试。
 - 当您的业务逻辑与FaaS提供商分开编写时，您可以编写传统的单元测试以确保其正常工作。
 - 编写集成测试以验证与其他服务的集成是否正常工作。

Serverless 应用的测试
---

在传统的测试金字塔里，我们会写更多的单元测试，并尽可能地尽少集成测试。同样的，在 Serverless 架构应用里，我们会写同样数量的单元测试，只是会写更多地集成测试，用于测试与服务间的集成。而这些测试，往往更加依赖于网络，并且这些测试越需要我们隔离架构层级。

因而，这种情况下，我们需要在测试上花费更多的精力。

对于单元测试来说，在之前的 [Express 示例](https://www.phodal.com/blog/serverless-development-guide-express-react-build-server-side-rendering/)里，我们做了一个不错的 Demo。我们隔离了 Express 与 Lambda 函数之间的代码，只需要再加上一个本地的 Express 环境，那么我们就可以直接在本地运行了。而借助于上一篇中提供的 [serverless-offline](https://www.phodal.com/blog/serverless-architecture-development-serverless-offline-localhost-debug-test/)，我们则可以隔离本地数据库。

随后，我们需要将 Serverless 应用部署测试环境。然后运行我们的测试脚本，自动地打开浏览器，进行操作。然后验证数据库中的数据是否是正确的，而一些都依赖于网络来执行。这就意味着，我们仿佛在不断地对接第三方系统，看上去就像一场场的恶梦。好在，我们也可以在 AWS 上运行测试，至少会让网络问题变得好一些。

步骤
---

在这里，我们要用 serverless-mocha-plugin 插件，这是一个基于 Mocha 框架、用于为 Serverless Framework 的添加测试的插件。

它的 Setup 过程非常简单，先添加插件：

```
yarn add --dev serverless-mocha-plugin
```

随后，添加到 ``serverless.yml`` 文件中：

```
plugins:
  - serverless-mocha-plugin
```

接着，我们就可以创建测试了。

### 创建测试

除了运行测试，它还提供创建测试的命令。只需要运行命令

```
sls create test -f functionName
```

如，在这里我们是这样的：

```
$ sls create test -f hello

Serverless: serverless-mocha-plugin: created test/hello.js
```

其文件的内容如下：

```
'use strict';

// tests for hello
// Generated by serverless-mocha-plugin

const mochaPlugin = require('serverless-mocha-plugin');
const expect = mochaPlugin.chai.expect;
let wrapped = mochaPlugin.getWrapper('hello', '/handler.js', 'hello');

describe('hello', () => {
  before((done) => {
    done();
  });

  it('implement tests here', () => {
    return wrapped.run({}).then((response) => {
      expect(response).to.not.be.empty;
    });
  });
});
```

如果你写过 Mocha 测试的话，那么你应该能看懂上面的代码。

### 运行测试

现在，我们就可以运行测试了，命令以以下的格式运行：

```
sls invoke test [--stage stage] [--region region] [-f function1] [-f function2] [...]
```

我们也可以直接运行所有的测试：

```
$ sls invoke test


  hello
    ✓ implement tests here


  1 passing (7ms)
```

### 更准确的测试 

让我们再让测试有针对性一点。在 ``handler.js`` 中，我们返回的 body 是一个字符串：

```
const response = {
  statusCode: 200,
  body: JSON.stringify({
    message: 'Go Serverless v1.0! Your function executed successfully!',
    input: event,
  }),
};
```  

那么，我们就应该去测试一下相应的字符串：

```
it('implement tests here', () => {
  return wrapped.run({}).then((response) => {
    let body = JSON.parse(response.body);
    expect(body.message).equal('Go Serverless v1.0! Your function executed successfully!');
  });
});
```

结论
---

总的来说，对于普通的单元测试来说，和一般的测试差不多。对于数据库操作什么相关的函数来说，这就是一件复杂的事。

多个语言运行环境
===

Serverless 与微服务在一点上很吸引人，你可以采用不同的语言来运行你的代码，不同的服务之间可以使用不同的语言。除了，在不同的 Serverless 服务里，采用不同的语言来开发。我们也可以在一个 Serverless 服务里，使用不同的语言来开发服务。

Serverless 多个语言运行环境
---

这次我们要创建的 Serverless 服务，其实现步骤相当的简单：

 - 使用 serverless 命令行工具，创建一个 node.js 模板
 - 在上一步的基础上添加一个 python 的服务。

于是，先让我们创建一个 hello, world 模板：

```
serverless create --template aws-nodejs --path multiple
```

然后，让我们创建一个 py-handler.py 的函数，代码如下所示：

```
import json
import datetime


def endpoint(event, context):
    current_time = datetime.datetime.now().time()
    body = {
        "message": "Hello, the current time is " + str(current_time)
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response
```

这个函数做了一件事，便是：获取当前的时间，然后导出并返回 json。

对应的，我们的 ``serverless.yml`` 文件也只是设置了不同的 runtime：

```
functions:
  pythonDemo:
    runtime: python2.7
    events:
      - http:
          method: get
          path: python
    handler: py-handler.endpoint
  jsDemo:
    runtime: nodejs6.10
    events:
      - http:
          method: get
          path: js
    handler: js-handler.hello
```

在 Python 函数部分，我们使用了 python2.7 来执行相应的代码。而在 JavaScript 部分则是 Node.js 6.10。

部署及测试
---

如果你还没有下载代码，那么先安装服务：

```
npm install -u https://github.com/phodal/serverless-guide/tree/master/multiple -n multiple
```

然后就愉快地部署吧：

```
$ serverless deploy

Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (640 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
....................
Serverless: Stack update finished...
Service Information
service: multiple
stage: dev
region: us-east-1
stack: multiple-dev
api keys:
  None
endpoints:
  GET - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/python
  GET - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/js
functions:
  pythonDemo: multiple-dev-pythonDemo
  jsDemo: multiple-dev-jsDemo
```

针对于 js 和 python 分别有两个对应的 HTTP 结点：

 - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/python
 - https://ulgoy525y4.execute-api.us-east-1.amazonaws.com/dev/js

访问对应的接口，就会返回对应的值，如下是 JS 返回的结果：

```
{"message":"Go Serverless v1.0! Your function executed successfully!"}
```

如下是 Python 函数返回的结果：


```
{"message": "Hello, the current time is 14:17:24.453136"}
```

当我们可以在一个服务里，写上不同的语言，就意味着：我们可以轻松地写上几十行的服务，然后轻松地部署。

对了，测试完了，记得执行 ``serverless remove``。

Serverless 开发物联网应用
===

原文链接：[Serverless 开发指南：AWS IoT 服务开发](https://www.phodal.com/blog/serverless-guide-development-aws-iot-serverless-example/)

在我开发一个完整的 Serverless 应用之前，我决定尝试一下不同的 Serverless 服务。这次我打算结合一下 AWS IoT，作为我对云服务与物联网结合的探索。

Serverless 框架安装服务
---

依旧的，我还将继续使用 Serverless 框架，而不是自己写 lambda 来实现。

因此，首先，让我们使用官方的服务 demo，执行以下的命令，就可以在本地复制远程的 demo 到本地。 

```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-iot-event -n aws-iot-example
```

其相当于将远程的 https://github.com/serverless/examples/tree/master/aws-node-iot-event 复制到本地的 ``aws-iot-example``

这次我们的 ``handler.js`` 只是打了个日志，其它什么也没做。

```
'use strict';

module.exports.log = (event, context, callback) => {
  console.log(event);
  callback(null, {});
};
```

重点还在于 ``serverless.yml`` 文件中的配置：

```
service: aws-node-iot-event

frameworkVersion: ">=1.5.0 <2.0.0"

provider:
  name: aws
  runtime: nodejs4.3

functions:
  log:
    handler: handler.log
    events:
      - iot:
          sql: "SELECT * FROM 'mybutton'"
```

在这个 ``CloudFormation`` 配置文件中，我们设置了运行配置 nodejs4.3，以及对应的 ``handler.log`` 函数 。在 ``events`` 里，写了一个 sql 语句来选择 ``mybutton`` 的相关内容，即查看 mybutton 相关主题的日志。

部署 AWS IoT Serverless 服务
---

依旧的我们只需要执行 ``serverless deploy`` 即可：

```
.................
Serverless: Stack update finished...
Service Information
service: aws-iot-example
stage: dev
region: us-east-1
stack: aws-iot-example-dev
api keys:
  None
endpoints:
  None
functions:
  log: aws-iot-example-dev-log
```

完成部署后， 我们就可以在 AWS Lambda 后台看到我们的相关函数：

![Serverless 控制台](images/server-side-example.png)

然后打开 AWS IoT 控制台，进入『测试』，即 MQTT 客户端页面：

![AWS IoT MQTT 测试页面](images/aws-iot-mqtt-test.png)

接着在发布主题里，填入 ``mybutton``，然后输入以下的内容：

```
{
  "message": "My first IoT event",
  "value": 2
}
```

如下图所示：

![AWS IoT 发布主题](images/aws-iot-mqtt-test.png)

查看日志
---

然后执行以下的命令，我们就可以查看到对应的日志：

```
$ serverless logs --function log
```

内容如下所示：

```
START RequestId: 76ad40d4-bc84-11e7-885a-6182fb121f8c Version: $LATEST
2017-10-29 16:37:57.481 (+08:00)  76ad40d4-bc84-11e7-885a-6182fb121f8c  { message: 'My first IoT event', value: 2 }
END RequestId: 76ad40d4-bc84-11e7-885a-6182fb121f8c
REPORT RequestId: 76ad40d4-bc84-11e7-885a-6182fb121f8c  Duration: 68.80 ms  Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 22 MB
```

如果只是测试用途，可以在执行完成后执行 ``serverless remove`` 来删除对应的服务，以减少开支。

使用 warmup 插件保活，避免应用冷启动
===

我们采用的 Serverless 底层的技术是 Lambda 计算。Lambda 计算是在调用时才运行，我们的程序不是时刻在后台运行的，当我们的 HTTP API 请求到了 API Gateway 的时候，才会开始调用我们的 Lambda 函数。这个时候，我们的应用程序才正式开发运行。从启动到运行的这段时间，就是 Lambda 函数的冷启动时间。

据今年初 [New Relic](https://blog.newrelic.com/2017/01/11/aws-lambda-cold-start-optimization/) 的统计数据表明，Lambda 函数的冷启动时间，在 50ms~200ms 之间——幸运的是，大多部分都是在 50ms 内。

除了，我们之前提到的使用[CRON 定时执行 Lambda 任务](https://www.phodal.com/blog/serverless-development-guide-cron-scheduled-job/)。我们还就可以试 serverless-plugin-warmup 插件。

使用 serverless-plugin-warmup 保持唤醒
---

首先，让我们添加 ``serverless-plugin-warmup`` 插件：

```
npm install serverless-plugin-warmup --save-dev
```

然后，将插件添加到 ``serverless.yml`` 中：

```
plugins:
  - serverless-plugin-warmup
```

接着添加对应的 ``warmup`` 属性：

```
functions:
  hello:
    warmup: true
```

也可以设置成只在生产环境运行：

```
functions:
  hello:
    warmup:
      - production
      - staging
```

添加对应的 role 和权限

```

provider:
  name: aws
  runtime: nodejs6.10
  iamRoleStatements:
    - Effect: 'Allow'
      Action:
        - 'lambda:InvokeFunction'
      Resource:
      - Fn::Join:
        - ':'
        - - arn:aws:lambda
          - Ref: AWS::Region
          - Ref: AWS::AccountId
          - function:${self:service}-${opt:stage, self:provider.stage}-*
```

接着，在我们的响应里添加一个处理函数：

```
  /** Immediate response for WarmUP plugin */
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
```

步骤上可能有些麻烦，现在也差不多了。


部署及测试
---

下面就可以部署了：

```
$ serverless deploy

..............................
Serverless: Stack update finished...
Service Information
service: warmup
stage: dev
region: us-east-1
stack: warmup-dev
api keys:
  None
endpoints:
  None
functions:
  hello: warmup-dev-hello
  warmUpPlugin: warmup-dev-warmUpPlugin
```

等个十几分钟，就可以看到日志：

```
START RequestId: 94e89a8f-c820-11e7-bc6a-d3e2ee9afad9 Version: $LATEST
2017-11-13 11:13:12.382 (+08:00)  94e89a8f-c820-11e7-bc6a-d3e2ee9afad9  WarmUP - Lambda is warm!
END RequestId: 94e89a8f-c820-11e7-bc6a-d3e2ee9afad9
REPORT RequestId: 94e89a8f-c820-11e7-bc6a-d3e2ee9afad9  Duration: 3.14 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB

START RequestId: 468dbf48-c821-11e7-9753-29196147d2a5 Version: $LATEST
2017-11-13 11:18:10.224 (+08:00)  468dbf48-c821-11e7-9753-29196147d2a5  WarmUP - Lambda is warm!
END RequestId: 468dbf48-c821-11e7-9753-29196147d2a5
REPORT RequestId: 468dbf48-c821-11e7-9753-29196147d2a5  Duration: 0.80 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB
```

这个时候，我们的应用程序一直在运行，因此我们需要考虑的一个问题是：费用。该插件在官方上，帮我们算了一下钱：

> WarmUP: runs 8640 times per month = $0.18
10 warm lambdas: each invoked 8640 times per month = $14.4
Total = $14.58 

一个唤醒函数，一个月才 0.18 刀，想想觉得还是可以的。

当然，它还可以自定义参数：

```
custom:
  warmup:
    cleanFolder: false,
    memorySize: 256
    name: 'make-them-pop'
    schedule: 'cron(0/5 8-17 ? * MON-FRI *)' // Run WarmUP every 5 minutes Mon-Fri between 8:00am and 5:55pm (UTC)
    timeout: 20
    prewarm: true // Run WarmUp immediately after a deployment
    folderName: '_warmup' // Name of the folder created for the generated warmup lambda
```

结论
---

有了这个插件，我们就可以在用户活跃的时间里，如白天，让 Lambda 函数保活。在用户不活跃的时间里，我们就可以连这点钱也省下。

定时执行任务
===

原文链接：[Serverless 应用开发指南：CRON 定时执行 Lambda 任务](https://www.phodal.com/blog/serverless-development-guide-cron-scheduled-job/)

在上一篇文章《[Serverless 应用开发指南：基于 Serverless 的 GitHub Webhook](https://www.phodal.com/blog/serverless-development-guide-create-github-hooks/)》里，我们介绍了如何用 Webhook 来触发定时的 Lambda 函数。这种方式与我们平时的 CI（持续集成）服务器相似，而CI（持续集成）服务器除了会监听 PUSH 事件。还会执行一些定时的任务，比如说每日构建出二进制包，用于 RELEASE。

因此，在这篇文章里，我将简单地介绍一下：如何定时触发 Lambda 任务。

Serverless 定时任务
---

幸运的是，带着我的想法，我在官网上看到了一个相关的事例。

于是，让我们安装一下这个服务到本地：

```
$ serverless install -u https://github.com/serverless/examples/tree/master/aws-node-scheduled-cron -n scheduled-cron
```

### rate 表达式

主要的定时代码写在 ``serverless.yml`` 文件中，如下所示：

```
functions:
  cron:
    handler: handler.run
    events:
      # Invoke Lambda function every minute
      - schedule: rate(1 minute)
```

AWS 支持两种类型的定时任务 ``rate`` 和 ``cron``。

Rate 表达式在创建计划事件规则时启动，然后按照其定义的计划运行。Rate 表达式有两个必需字段。这些字段用空格分隔。

```
rate(value unit)
```

相应的值表示如下：

 - value，正数（ >0 的数）。
 - unit，时间单位。其有效值：minute | minutes | hour | hours | day | days

因此，上面的代码 ``rate(1 minute)`` 表示的是每一分钟执行一次。

### cron 表达式

下面的代码，则使用的是 cron 表达式

```
  secondCron:
    handler: handler.run
    events:
      # Invoke Lambda function every 2nd minute from Mon-Fri
      - schedule: cron(0/2 * ? * MON-FRI *)
```

cron 表达式的格式稍微复杂一些。但是它与 Linux 上的 cron 是不太一样的：

```
cron(<分钟> <小时> <日期> <月份> <星期> <年代>)
```

对应于下表：

|  字段         |  值            | 通配符         |
| ------------- |:--------------:|:-------------:|
| 分钟          | 0-59           | , - * /       |
| 小时           | 0-23           | , - * /       |
| 日期           | 1-31           | , - * ? / L W |
| 月             | 1-12 or JAN-DEC| , - * /       |
| 星期几         | 1-7 or SUN-SAT | , - * ? / L # |
| 年代           | 1970-2199      | , - * /       |


更详细的信息，可以阅读官方的文档：[规则的计划表达式](http://docs.aws.amazon.com/zh_cn/AmazonCloudWatch/latest/events/ScheduledEvents.html)。

于是，上面的表达式，每星期一到星期五（MON-FRI），每 2 分钟运行一次。

部署
---

接下来，让我们部署代码试试：

```
$ serverless deploy
```

相应的部署过程日志如下：

```
...............
Serverless: Stack update finished...
Service Information
service: scheduled-cron
stage: dev
region: us-east-1
stack: scheduled-cron-dev
api keys:
  None
endpoints:
  None
functions:
  cron: scheduled-cron-dev-cron
  secondCron: scheduled-cron-dev-secondCron
```

然后，让我们看看日志：

```
$ serverless logs -f  cron -t
```

对应的日志如下：


```
2017-11-01 16:41:14.112 (+08:00)  6b33ad33-bee0-11e7-9439-23daa7bb59a8  Your cron function "scheduled-cron-dev-cron" ran at Wed Nov 01 2017 08:41:14 GMT+0000 (UTC)
END RequestId: 6b33ad33-bee0-11e7-9439-23daa7bb59a8
REPORT RequestId: 6b33ad33-bee0-11e7-9439-23daa7bb59a8  Duration: 0.86 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB

START RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2 Version: $LATEST
2017-11-01 16:42:13.724 (+08:00)  8ea1a80f-bee0-11e7-a0c9-331175998dc2  Your cron function "scheduled-cron-dev-cron" ran at Wed Nov 01 2017 08:42:13 GMT+0000 (UTC)
END RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2
REPORT RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2  Duration: 4.08 ms Billed Duration: 100 ms   Memory Size: 1024 MB  Max Memory Used: 20 MB
```

这表明我们的程序，正在以每分钟的状态运行着。

当我们想做一个 Serverless 的爬虫定期执行某个任务，这样做可以帮我们节省大量的成本。

末了，记得执行：

```
$ serverless remove
```

使用 Simulate 插件在本地运行 Lambda
===

Serverless 应用的一个不方便之处：缺少一个本地的调试环境。在之前的那篇《[Serverless 架构应用开发：使用 serverless-offline 在本地部署与调试](https://www.phodal.com/blog/serverless-architecture-development-serverless-offline-localhost-debug-test/)》中， 我们提到了使用 ``serverless-offline`` 插件来在本地部署和调试。在本文中，我们将介绍 ``serverless-plugin-simulate`` 插件来解决相似的问题。

serverless-plugin-simulate 插件
---

``serverless-plugin-simulate`` 是一个的概念证明，用来尝试使用 docker 镜像复制 Amazon API Gateway 来运行lambda。

它可以支持以下的功能：

 - 由 docker-lambda 支持的 λ 运行时环境。
 - CORS
 - 授权
    - 自定义授权者（支持）
    - Coginito 授权（暂不支持）
 - Lambda集成
    - Velocity 模板（支持）。
 - Lambda代理集成（支持的）。 

那么，让我们来试试使用 ``serverless-plugin-simulate`` 插件来模拟 Lambda 环境。


安装 serverless-plugin-simulate 及环境 
---

``注意``：由于这里需要使用 Docker，建议读者先行安装  Docker。

然后，让我们来创建 Serverless 应用：

```
serverless create --template aws-nodejs --path simulate-lambda
```

接着，就可以安装 serverless-plugin-simulate 插件了

```
yarn add --dev serverless-plugin-simulate
```

然后，添加到 ``serverless.yml`` 中：

```
plugins:
  - serverless-plugin-simulate


custom:
  simulate:
    services: docker-compose.yml
```

上面的配置中依赖于 ``docker-compose.yml`` 文件，创建、然后输入：

```
version: '2'
```

保存，并退出。

紧接着，运行：``docker pull lambci/lambda``。

```
$ docker pull lambci/lambda

Using default tag: latest
latest: Pulling from lambci/lambda
5aed7bd8313c: Pull complete
d60049111ce7: Pull complete
7791f7ad5cf2: Pull complete
Digest: sha256:4d511dfc1a264ccc69081ceb00116dd0bea380080ad1e89c2f48752f6c4670df
Status: Downloaded newer image for lambci/lambda:latest
```

它将从服务端下载 lambci 的 lambda 镜像。

运行及测试
---

然后运行 simlaute

```
$ sls simulate apigateway -p 5000

Serverless: Starting mock services.
Serverless:
Serverless: [GET /undefined] => λ:hello
Serverless: Invoke URL: http://localhost:5000
Serverless: HTTP Event Not Found: Try checking your serverless.yml
```

发现少了一个入口，于是在 ``serverless.yml`` 中添加了路径

于是：

```

functions:
  hello:
    handler: handler.hello
    events:
      - http:
          method: get
          path: hello
```

接着再次运行，然后访问：[http://localhost:5000/hello](http://localhost:5000/hello)

```
$ npm start

> simulate@1.0.0 start /Users/fdhuang/learing/serverless-guide/simulate
> sls simulate apigateway -p 5000

Serverless: Starting mock services.
Serverless:
Serverless: [GET /hello] => λ:hello
Serverless: Invoke URL: http://localhost:5000
Serverless: Creating event
Serverless: Invoking hello
Serverless: Invoking function handler.hello
START RequestId: 18b5b89b-7118-1344-7f1e-a3b49c5c26d4 Version: $LATEST
END RequestId: 18b5b89b-7118-1344-7f1e-a3b49c5c26d4
REPORT RequestId: 18b5b89b-7118-1344-7f1e-a3b49c5c26d4	Duration: 6.27 ms	Billed Duration: 100 ms	Memory Size: 1024 MB	Max Memory Used: 28 MB

{"statusCode":200,"body":"{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":{\"path\":\"/hello\",\"headers\":{\"host\":\"localhost:5000\",\"connection\":\"keep-alive\",\"cache-control\":\"max-age=0\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36\",\"upgrade-insecure-requests\":\"1\",\"accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\",\"dnt\":\"1\",\"accept-encoding\":\"gzip, deflate, br\",\"accept-language\":\"zh-CN,zh;q=0.8,en-GB;q=0.6,en;q=0.4,it;q=0.2,zh-TW;q=0.2,ja;q=0.2\",\"cookie\":\"mezzanine-rating=\\\"\\\\054blog.blogpost.20\\\\054blog.blogpost.13\\\\054blog.blogpost.5\\\\054blog.blogpost.19\\\\054blog.blogpost.21\\\\054blog.blogpost.9\\\"; csrftoken=A9i99HpofF4q19ehVQY4D8w0cRwddlnSwbz4DUQV0yqax3cufTN8Np5gzldqkotH; _ga=GA1.1.427084651.1503497781\",\"if-none-match\":\"W/\\\"6a9-Sps0n/Pmo7hiZsErZVJqVbiAPPk\\\"\"},\"pathParameters\":{},\"requestContext\":{\"accountId\":\"localContext_accountId\",\"resourceId\":\"localContext_resourceId\",\"stage\":\"dev\",\"requestId\":\"localContext_requestId_30305881537279267\",\"identity\":{\"cognitoIdentityPoolId\":\"localContext_cognitoIdentityPoolId\",\"accountId\":\"localContext_accountId\",\"cognitoIdentityId\":\"localContext_cognitoIdentityId\",\"caller\":\"localContext_caller\",\"apiKey\":\"localContext_apiKey\",\"sourceIp\":\"::ffff:127.0.0.1\",\"cognitoAuthenticationType\":\"localContext_cognitoAuthenticationType\",\"cognitoAuthenticationProvider\":\"localContext_cognitoAuthenticationProvider\",\"userArn\":\"localContext_userArn\",\"userAgent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36\",\"user\":\"localContext_user\"}},\"resource\":\"localContext_resource\",\"httpMethod\":\"GET\",\"queryStringParameters\":{},\"body\":\"{}\",\"stageVariables\":{}}}"}
Serverless: Mapping response
GET /hello 200 1518.527 ms - 1802
Serverless: HTTP Event Not Found: Try checking your serverless.yml
GET /favicon.ico 403 1.084 ms - 23
HTTP Event Not Found: Try checking your serverless.yml
```

就可以得到类似于生产环境的 Lambda 函数的结果。

使用 GraphQL 实现更好的 API
===

AWS Lambda 上可以运行不同的语言，提供不同语言的运行环境。这也就意味着，它不仅可以[跑 Express 来提供一个 RESTful API](https://www.phodal.com/blog/serverless-developement-gui-lambda-api-gateway-dynamodb-create-restful-services/)，它也可以运行各式各样的 Node.js 库，比如说 GraphQL。

GraphQL是一种API查询语言，是一个对自定义类型系统执行查询的服务端运行环境。我们可以编写一个使用 GraphQL 编写一个查询：

```
{
  me {
    name
  }
}
```

以此来，获取我们想到的 JSON 结果：

```
{
  "me": {
    "name": "Luke Skywalker"
  }
}
```

它看上更像是一层 BFF 层，在前端和后台之间，提供一个更适合于前端使用的接口。

GraphQL hello, world
---

现在，让我们愉快地开始我们的学习之旅吧。

首先，让我们创建我们的应用：

```
serverless create --template aws-nodejs --path graphql
```

然后添加 ``graphql`` 库：

```
yarn add graphql
```

接着，根据 GraqhQL.js 在 GitHub 的示例，编写我们的 ``handler.js``：

```
/* handler.js */
const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require('graphql')

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        }
      }
    }
  }),
})

module.exports.query = (event, context, callback) => {
  console.log(event.queryStringParameters, event.queryStringParameters.query)
  return graphql(schema, event.queryStringParameters.query)
  .then(
    result => callback(null, {statusCode: 200, body: JSON.stringify(result)}),
    err => callback(err)
  )
}

```

代码分为了两部分，第一部分是创建了一个 GraphQL 的 Schema；第二部分则是对应的查询代码。在查询部分，我们取出 Lambda 事件中的 queryStringParameters，然后其中的查询代码。接着，由 graphql 执行对应的查询。

然后，配置一下我们的 ``serverless.yml``：

```

functions:
  query:
    handler: handler.query
    events:
      - http:
          path: query
          method: get
```

并部署代码到服务器上:

```
service: graphql
stage: dev
region: us-east-1
stack: graphql-dev
api keys:
  None
endpoints:
  GET - https://5ol2v4lnx3.execute-api.us-east-1.amazonaws.com/dev/query
functions:
  query: graphql-dev-query
```

现在让我们发起一次查询：

```
$ curl -G https://5ol2v4lnx3.execute-api.us-east-1.amazonaws.com/dev/query --data-urlencode 'query={ hello }'


{"data":{"hello":"world"}}
```

显然，我们的 hello, world 是成功的。

更复杂的示例
---

接着，让我们看一个更复杂的示例。

> 一个 GraphQL 查询可以包含一个或者多个操作（operation），类似于一个RESTful API。操作（operation）可以使两种类型：查询（Query）或者修改（mutation）

这意味着，我们还能使用 GraphQL 对相应的数据进行操作。在这里，我们可以直接使用官方的 DEMO，先安装它：

```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-graphql-api-with-dynamodb -n graphql-dynamodb
```

然后，部署：

```
$ serverless deploy

...
stack: graphql-dynamodb-dev
api keys:
  None
endpoints:
  GET - https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query
functions:
  query: graphql-dynamodb-dev-query
```

接着编写一个查询的请求：

```
$ curl -G 'https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query={greeting(firstName: "world")}'

{"data":{"greeting":"Hello, world."}}
```

尝试使用 mutation 来修改内容：

```
$ curl -G 'https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query=mutation {changeNickname(firstName: "world", nickname: "phodal")}'

{"data":{"changeNickname":"phodal"}}
```

再次查询看相应的内容是否有修改：

```
$ curl -G 'https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query={greeting(firstName: "world")}'

{"data":{"greeting":"Hello, phodal."}}
```

然后，让我们来看看对应的修改逻辑。

### GraphQL 修改 DymanoDB 的值

先看看新的 schema：

```
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    ...
    }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType', // an arbitrary name
    fields: {
      changeNickname: {
        args: {
          firstName: { name: 'firstName', type: new GraphQLNonNull(GraphQLString) },
          nickname: { name: 'nickname', type: new GraphQLNonNull(GraphQLString) },
        },
        type: GraphQLString,
        resolve: (parent, args) => changeNickname(args.firstName, args.nickname),
      },
    },
  })
});
```

在新的 schema 中定义了一个 mutation，在这个 mutation 对象里，我们通过 ``resolve`` 来调用 ``changeNickname`` 方法来处理数据库：

```
const changeNickname = (firstName, nickname) => promisify(callback =>
  dynamoDb.update({
    TableName: process.env.DYNAMODB_TABLE,
    Key: { firstName },
    UpdateExpression: 'SET nickname = :nickname',
    ExpressionAttributeValues: {
      ':nickname': nickname,
    },
  }, callback))
  .then(() => nickname);
```

我们从通过原有的 name 作为 Key 查找，然后替换其中的 nickname 的值。

有了这个 DEMO，就意味着，未来我们可以轻松地在我们所有的 RESTful API 前加上这一层，来提供一个 BFF 层。

Serverless 应用示例：前端错误日志及事件收集系统
===

最近在交接项目，也因此有了一些时间。之前想过做一个前端的错误日志系统，便想着直接用 Serverlss 做了好了。

开始之前先让我简单地介绍一下：[https://github.com/phodal/molog](https://github.com/phodal/molog)，以便于了解我们的需求及功能。

Molog 使用
---

先让我们看看最后要怎么用，在网页上引入：

```
<script data-component="homepage" data-env="dev" src="//static.pho.im/molog.min.js"></script>
```

顾名思义，其中的 component 针对的不是不同组件的名字，而 env 便是具体的环境。

前端的代码是基于 sherlog.js，因此在事件上也是差不多的：

```
Molog.push({field: 'xxx', action:' '}, function() { })
```

Serverless 错误收集系统架构设计
---

在之前的文章中，我们讨论过错误日志收集是一个很好的 Serverless 应用使用场景。

### 架构设计

事实上，这样的系统很简单：

![系统架构图](images/molog-architecture.png)

1.**前端通过 window.onerror 来捕获错误日志**

```
window.onerror = function(message, source, lineno, colno, error) {
 ... 
}
```

2. **然后将错误日志发给 AWS Lambda 来处理**

3. **AWS Lambda 将数据存储到 AWS DynamoDB 数据库里**

4. **当用户打开后台时，从 AWS DynamoDB 获取相应的数据**

5. **前端的静态文件，通过 S3 + Cloudfront 作为 CDN 来分发前端资源**

Molog 系统实现
---

### 1. 存储日志和事件

要在 AWS 上实际这样的系统，就便得很简单了。我们只需要存储一下这些数据即可，相关的存储逻辑如下所示：

```
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      data: JSON.stringify(event.queryStringParameters),
      env: env,
      component: component,
      createdAt: timestamp
    },
  };
```

这里的 ``env`` 和 ``component`` 是在 script 标签中遍历解析出来的：

```
env: function() {
  var s = doc.getElementsByTagName('script')
    , env;
  for( var i = 0, l = s.length; i < l; i++) {
    if (s[i].src.indexOf('molog') > -1) {
      env = s[i].getAttribute('data-env');
      break;
    }
  }
  this.env = env || '';
}
```

然后，再将这个 URL 放置到 POST 的 URL 中，即 ``serverless.yml`` 的配置文件中：

```

functions:
  create:
    handler: create/index.handler
    events:
      - http:
          path: /{component}/{env}/
          method: get
          cors: true
```

从 URL 中获取这些相关的参数

### 2. 读取日志

有了上面的基础，有读取日志也很简单，首先配置好 URL：

```
  list:
    handler: list/index.list
    events:
      - http:
          path: /{component}/{env}/logs
          method: get
          cors: true
```

然后从数据库中获取这些结果：

```
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    FilterExpression: 'env = :env and component = :component',
    ExpressionAttributeValues: {
      ':env': env,
      ':component': component,
    }
  };
  dynamoDb.scan(params, (error, result) => {

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
      },
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
```

这样就可以得到相关的日志了。

问题
---

就这么简单，发现由于  CloudFront 在国内有点水土不服，并且提供压缩的功能，导致加载速度有点慢。

Serverless 应用示例：二维码生成
===

昨天看到了一篇关于二维码使用的文章，其设计初衷是使用二维码卡片来帮助小朋友控制智能音箱。即在 Raspberry Pi 上使用摄像头来识别二维码，二维码卡片上是一些简单的操作，如播放音乐、暂停等等，卡片的另外一面则是相应的解释。这是一个有趣的二维码在物联网应用的场景。

于是乎，我便想尝试一下直接在云端生成二维码图片，并保存。当然了，对于二维码来说，直接在浏览器上生成显然是更加简单友好的。

总览
---

在这个项目里，我们的主要流程是：

1. 从 URL 中获取要生成的二维码字符串
2. 将生成的二维码图片上传到 AWS S3
3. 重定向 URL 到生成的 AWS S3 上

对，就是这么简单，实现起来也很简单。

生成应用
---

照例我们需要先安装有 ``serverless``，如果没有的话，请使用：

```
npm install -g serverless
```

然后来创建我们的应用：

```
serverless create --template aws-nodejs --path qrcode
```

愉快地进行我们的 init commmit。

配置资源
---

在这个项目里，我们所需要的 AWS 资源有：

 - AWS S3 用于存储图片
 - Route 53 用于分配路由

那么，接下来就是打开 ``serverless.yml`` 文件进行配置。

```
resources:
  Resources:
    PackageStorage:
      Type: AWS::S3::Bucket
      Properties:
        AccessControl: PublicRead
        BucketName: ${self:custom.qrcodeBucket}
        LifecycleConfiguration:
          Rules:
            - ExpirationInDays: 1
              Status: Enabled
```

以及配置，相应的权限：

```
provider:
  name: aws
  runtime: nodejs6.10
  iamRoleStatements:
    - Effect: "Allow"
      Action:
        - "s3:ListBucket"
        - "s3:PutObject"
        - "s3:PutObjectAcl"
      Resource:
        - "arn:aws:s3:::${self:custom.qrcodeBucket}"
        - "arn:aws:s3:::${self:custom.qrcodeBucket}/*"
```

还有 Route 53 中的域名：

```
plugins:
  - serverless-domain-manager

custom:
  # change this, so it's unique for your setup
  qrcodeBucket: ${self:service}.${self:provider.stage,opt:stage}
  stageVariables:
    bucketName: ${self:custom.qrcodeBucket}
  customDomain:
    domainName: qrcode.pho.im
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
```

接下来，就可以愉快地写代码了。

生成二维码
---

为了生成二维码，我找到了项目：[node-qrcode](https://github.com/soldair/node-qrcode)，然后安装之：

```
yarn add qrcode
```

试了试 DEMO：

```
QRCode.toFile('path/to/filename.png', 'Some text', {
  color: {
    dark: '#00F',  // Blue dots
    light: '#0000' // Transparent background
  }
}, function (err) {
  if (err) throw err
  console.log('done')
})
```

不对，这样好像有问题：


```
  QRCode.toDataURL(string, {
    errorCorrectionLevel: 'H'
  }, function (err, url) {

  }
```

在尝试了多次之后，我手动将 base64 转成了 png：

```
new Buffer(url.replace(/^data:image\/\w+;base64,/, ""), 'base64')
```

随后，就可以上传图片了 AWS S3 上。

上传 AWS S3
---

只需要配置好相应的权限和 Key、Bucket，然后使用 ContentEncoding 为 base64：

```
const params = {
  Bucket: process.env.bucketName,
  Key: key,
  ACL: 'public-read',
  Body: new Buffer(url.replace(/^data:image\/\w+;base64,/, ""), 'base64'),
  ContentEncoding: 'base64',
  ContentType: 'image/png'
};

s3.putObject(params, function (err, data) {
  if (err) {
    return callback(new Error(`Failed to put s3 object: ${err}`));
  }

  const response = {
    statusCode: 302,
    headers: {
      location: `https://s3.amazonaws.com/${process.env.bucketName}/${key}`
    }
  };

  return callback(null, response);
})
```

将 ACL 配置为 public-read，就可以在外网访问了。

优化二维码
---

在多次测试之后，我决定优化一下上传的参数：

```
  QRCode.toDataURL(string, {
    errorCorrectionLevel: 'H',
    width: 512,
    margin: 2,
    color: {
      light: '#fdfdfd',
      dark: '#384452'
    }
  }
```  

部署及测试
---

好了，现在我们就可以部署，执行相应的部署命令：

```
$ sls deploy

Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (699.08 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...
Service Information
service: qrcode
stage: dev
region: us-east-1
stack: qrcode-dev
api keys:
  None
endpoints:
  GET - https://swsaner181.execute-api.us-east-1.amazonaws.com/dev/
functions:
  create: qrcode-dev-create
Serverless Domain Manager Summary
Domain Name
  qrcode.pho.im
Distribution Domain Name
  d1vpwj4ctk345u.cloudfront.net
Serverless: Removing old service versions...
```

然后在网页上测试，我们创建的服务地址是：https://qrcode.pho.im/?q={string}

使用这个 URL 进行测试：https://qrcode.pho.im/?q=http://weixin.qq.com/r/mnVYQHrEVicprT4j9yCI

加上使用的短链服务就是：[https://x.pho.im/Z5t7](https://x.pho.im/Z5t7)

Serverless 应用示例：Serverless 密码管理器
===

最近的几年里，每个人在密码上都遇到越来越多的挑战，即需要一个复杂的密码，又需要能记得住它们——两者几乎不可兼得。于是乎，我们开始使用上各式各样的密码管理器，并为之付上了费。又或者是一些开源的、不能同步的密码管理工具——毕竟服务器是要钱的。

然而作为一个程序员，我觉得嘛，他/她们写的代码都不可靠——**愈是通用的软件，愈加危险。**一旦一个地方出现问题，那么其它地方都会有问题。比如说，你的 Master Password 泄露了，那么相应的所有的密码也就相当于泄露了。以致于我又重新设计了自己的密码管理体系，写了一个自己的密码管理器。

## 取个密码

取一个变量很纠结，取一个密码很头痛——更何况，我们要取一堆密码。于是，最好的方式就是写一个规则，来生成不同密码。从安全的角度来看，密码自然是又长又复杂的为好。可又复杂又长的代码，我们这些非机器的人是记不住的。

根据我的现有模式，我有这么几种模式来管理密码。

### 特定平台 + 固定密码

11 年前我使用一个固定的、统一的密码，直到一系列的明文密码泄露事件，我在不同的平台采用了不同的密码。在经历了一系列的忘记密码之后，我开始采用平台限定的密码，即不同的平台，密码是半动态的。如下就是一个简单的，对应于不同平台的代码体系，如：

 - 京东：`jd-1qaz2wsx`
 - 淘宝：`tb-1qaz2wsx`

而这样的密码本身也是不安全的，如果有人知道密码规则的话。那么，这无异于一场灾难。于是，我在设计出规则到现在，仅会**在一些重要的网站上**，采用这种规则。

### 密码表 + 特定平台 + 固定密码

应对于上一种方式，如果我们拥有一个密码表，来稍微变换一下形式，诸如：

 - 京东：`tb-1qaz2wsx`
 - 淘宝：`jd-1qaz2wsx`

那么，我们的密码就显得更加可靠。

### 随机密码 + 固定密码

如我们所知道的那样，只要是有规律的代码，都存在被破解的风险。所以在两年前，我写了一个简单的脚本来生成密码：

```python
from random import choice
from string import hexdigits, punctuation
import time

base_time = str(time.time())[12:16]
base_string = ''.join(choice(hexdigits) for i in range(6))
base_punctuation = ''.join(choice(punctuation) for j in range(2))

print(base_string + base_punctuation + base_time)
```

从时间戳取四个数字，从 16 进制数中取出 6 位，再从特殊字符中取出两位，以此来构成我的密码的主要部分。而剩下的部分则是固定密码，固定的部分存在脑子里——万一密码都看到了，那么问题也不到。

唯一需要担心的是，键盘上的值可能被记住了。即，有人监听你的输入，又或者是记住了剪贴板上的值——从这个角度上来看，输入法也是一个危险的存在。为此，我们还需要更高级的工具。

### 密码管理器

使用密码管理器，毫无疑问是目前为止最为通用的一种方式，诸如 1Password 和 LastPass 都是相对比较成熟的方案。它们可以运行在各种平台上，相互之间同步代码，并帮你自动填充密码。

然而，这些工具都是按年付费的，部分还是私有软件。

### 开启 MFA

但是不管怎样，密码的方式仍然是相当的不可靠——一旦泄露了就悲剧了。为此，如果你所用的平台，可以开启 MFA，就开启 MFA 吧。即 Multi-Factor Authentication (MFA) 是一种简单有效的最佳安全实践方法，它能够在用户名和密码之外再额外增加一层安全保护。

## Serverless 架构下的密码管理器：MoPass

要是我使用的是密码管理器的话，就没有本文的这么多事了。所以，我正在写自己的秘密管理器。

在编写我的第三本书的时候，同时编写了我的 markdown 编辑器：Phodit。Phodit 的成功实施，让我在定制个人工具上，有了更坚定的信心和丰富的经验，所以我开始编写我的密码管理器——基于 Serverless 架构的密码管理器。

![MoPass C4 Context](images/mopass-c4-context.jpg)

系统的组件和关系相对都比较简单：

![MoPass C4 Container](images/mopass-c4-container.jpg)

大抵就是对于密码的加解密和 CRUD，只是客户端有所不同罢了。

由于设计的初衷是：**针对于个人的轻量级密码管理器**，所以在最初设计的时候，是根据 Master Password + MD5 来生成后台的授权 Token。当用户数量变多的时候，Master Password 便会出现重复，导致密码重复的问题——由于使用了 Key + Master Password 来对密码进行加密和解密，虽然 Master Password 相同，但是也无法解密别人的密码。

### 在终端中使用 CLI

> **一个不习惯用命令行的程序员，不是一个高效的程序员。**——Phodal

一个密码管理器，最好是直接输个命令就能获取了，而不是打开某个软件、输入密码、找到对应的条目，再复制密码。对于 MoPass 来说，获取密码，只需要这么一步：

```
➜  mopass git:(master) mopass --get GitHub
? master password ******
200: Copied to clipboard!
```

而后，我们就可以直接粘贴我们的密码——为了查看所有的条目，只需要 ``mopass --list``。从这等意义上来说，这个工具更适合于程序员使用。而为了使用更加方便，我还是写了一个 Chrome 上的插件——毕竟，输入密码的场景，主要是在网页上，而不是终端里——我可不习惯用 w3m 来浏览网页。

### 通过 Chrome 插件中使用

Chrome 插件，只需要输入密码即可——不过，为了安全考虑，不在浏览器上存储密码，而是每次从服务器上获取。这个问题，可以在我稍有余力的时候，再去看看怎么优化——毕竟 CLI 更快。

## 结论

最后，请不到你的密码贴在笔记本上。

GitHub: https://github.com/phodal/mopass

# Serverless 框架 OpenWhisk 开发指南

在尝试了使用 AWS 开发 Serverless 应用之后，我便想尝试使用 OpenWhisk 框架来搭建自己的 Serverless 服务。

> Apache OpenWhisk（http://openwhisk.org/）是一个由IBM和Adobe驱动的开源项目，它是一个健壮的FaaS平台，可以部署在云或数据中心内。相比其他serverless项目，OpenWhisk是一个健壮的、可扩展的平台，支持数千并发触发器和调用。

## OpenWhisk 简介

其系统架构如下所示：

![OpenWhisk 流处理流程](images/OpenWhisk_flow_of_processing.png)

对应的组件的功能如下：

 - Nginx 暴露HTTP（S）端点给客户端。
 - Controller 充当系统的守门员、系统的协调者，它将决定请求最终采取的路径。
 - CouchDB 护和管理系统的状态。
 - Consul 作为系统每个组件可访问的单一数据源。 同时，consul还提供服务发现功能，使控制器发现调用操作的实体。 
 - Apache Kafka 用于构建实时数据管道和流应用程序。
 - Invoker 使用 Scala实现，它是处理执行过程的最后阶段。
 - Docker， 几乎所有的 OpenWhisk 组件都打包和部署为容器。


## macOS 搭建 OpenWhisk 环境

官网的指引很简单，但是中间还是遇到一些环境问题。

首先 clone 代码

```
git clone --depth=1 https://github.com/apache/incubator-openwhisk.git openwhisk
```

然后于是虚拟机的目录：

```
cd openwhisk/tools/vagrant
```

接着执行 hello 命令

```
$./hello

./hello: line 8: vagrant: command not found
```

便提示 vagrant 没有安装。Vagrant 只是一个虚拟机管理和配置工具，为了安装 vagrant，还需要先安装 virtualbox 虚拟机：

```
brew cask install virtualbox
```

然后安装 vagrant，顺便也 可以安装 vagrant-manager

```
$ brew cask install vagrant vagrant-manager

==> Satisfying dependencies
==> Downloading https://releases.hashicorp.com/vagrant/2.0.1/vagrant_2.0.1_x86_64.dmg
######################################################################## 100.0%
==> Verifying checksum for Cask vagrant
==> Installing Cask vagrant
==> Running installer for vagrant; your password may be necessary.
==> Package installers may write to any location; options such as --appdir are ignored.
Password:
==> installer: Package name is Vagrant
==> installer: Installing at base path /
==> installer: The install was successful.
🍺  vagrant was successfully installed!
==> Satisfying dependencies
==> Downloading https://github.com/lanayotech/vagrant-manager/releases/download/2.6.0/vagrant-manager-2.6.0.dmg
######################################################################## 100.0%
==> Verifying checksum for Cask vagrant-manager
==> Installing Cask vagrant-manager
==> Moving App 'Vagrant Manager.app' to '/Applications/Vagrant Manager.app'.
```

再次执行：

```
$ ./hello
Bringing machine 'default' up with 'virtualbox' provider...
==> default: Box 'ubuntu/trusty64' could not be found. Attempting to find and install...
    default: Box Provider: virtualbox
    default: Box Version: >= 0
==> default: Loading metadata for box 'ubuntu/trusty64'
    default: URL: https://vagrantcloud.com/ubuntu/trusty64
==> default: Adding box 'ubuntu/trusty64' (v20171205.0.1) for provider: virtualbox
    default: Downloading: https://vagrantcloud.com/ubuntu/boxes/trusty64/versions/20171205.0.1/providers/virtualbox.box
    default: Progress: 11% (Rate: 2806k/s, Estimated time remaining: 0:04:16)
```

然后挑个网速好的时间，比如早上（经过测试晚上的下载速度比较慢），等它下载完。下载完后，便自动开始在虚拟机里搭建 OpenWhisk 环境，如安装 Docker、Git 等等的操作。

最麻烦的是等待 Docker 安装拉各种镜像。OpenWhisk系统由许多组件构建而成：

![OpenWhisk 组件](images/openwhisk-components.png)

直至：

```
    default: +++ cat /home/vagrant/openwhisk/ansible/files/auth.guest
    default: ++ wsk property set --apihost 192.168.33.13 --namespace guest --auth 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
    default: ok: whisk auth set. Run 'wsk property get --auth' to see the new value.
    default: ok: whisk API host set to 192.168.33.13
    default: ok: whisk namespace set to guest
    default: ++ wsk action invoke /whisk.system/utils/echo -p message hello --result
    default: {
    default:     "message": "hello"
    default: }
    default: +++ date
    default: ++ echo 'Mon Dec 11 12:09:23 UTC 2017: build-deploy-end'
```

我们就顺利地运行了我们的 hello world。

你也可以 ssh 到机器上：``vagrant ssh``，然后运行 ``wsk`` 命令试试:

```
$ vagrant@vagrant-ubuntu-trusty-64:~/openwhisk/bin$ wsk

        ____      ___                   _    _ _     _     _
       /\   \    / _ \ _ __   ___ _ __ | |  | | |__ (_)___| | __
  /\  /__\   \  | | | | '_ \ / _ \ '_ \| |  | | '_ \| / __| |/ /
 /  \____ \  /  | |_| | |_) |  __/ | | | |/\| | | | | \__ \   <
 \   \  /  \/    \___/| .__/ \___|_| |_|__/\__|_| |_|_|___/_|\_\
  \___\/ tm           |_|

Usage:
  wsk [command]

Available Commands:
  action      work with actions
  activation  work with activations
  api         work with APIs
  help        Help about any command
  list        list entities in the current namespace
  namespace   work with namespaces
  package     work with packages
  property    work with whisk properties
  rule        work with rules
  sdk         work with the sdk
  trigger     work with triggers
```

## Serverless 框架 OpenWhisk 开发指南：使用 Serverless Framework 开发 OpenWhisk 应用

### Serverless OpenWhisk

在上一篇文章《[Serverless 框架 OpenWhisk 开发指南：使用 Node.js 编写 hello, world](https://www.phodal.com/blog/serverless-framework-openwhisk-nodejs-hello-world/) 里，我们介绍了怎么连接客户端与 OpenWhisk 服务器。在这里，我假设读者已经有相关经验了。

首先，我们需要先安装对应的 Node.js 模块：

```
$ npm install --global serverless serverless-openwhisk
```

然后使用模板创建：

```
serverless create --template openwhisk-nodejs --path my_service
cd my_service
npm install
```

因为我们是在本地运行的服务，我们需要修改我们的 ``serverless.yml`` 文件，添加 ``ignore_certs`` 参数以忽略证书：

```
provider:
  name: openwhisk
  ignore_certs: true
```

然后，就可以继续愉快地使用 ``sls deploy`` 部署了：

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Compiling Functions...
Serverless: Compiling API Gateway definitions...
Serverless: Compiling Rules...
Serverless: Compiling Triggers & Feeds...
Serverless: Deploying Functions...
Serverless: Deployment successful!

Service Information
platform:	http://192.168.33.13:10001
namespace:	guest
service:	my_service

actions:
my_service-dev-hello    hello    node_version

triggers:
**no triggers deployed**

rules:
**no rules deployed**

endpoints (api-gw):
**failed to fetch routes**
endpoints (web actions):
**no web actions deployed**
```

### 测试服务

现在，我们就可以测试我们的 OpenWhisk 函数了：

```
$ serverless invoke --function hello
{
    "payload": "Hello, World!"
}
$ serverless invoke --function hello --data '{"name": "OpenWhisk"}'
{
    "payload": "Hello, OpenWhisk!"
}
```

## Serverless 框架 OpenWhisk 开发指南：使用 Node.js 编写 hello, world

我们将介绍：如何将上一节搭建的 OpenWhisk 服务作为服务器，并使用自己的 macOS 作为客户端。然后，在这之上运行我们的 Serverless 应用

## 配置 OpenWhisk 客户端

### 获取 CLI

首先，我们需要在我们的电脑上安装 OpenWhisk 的 CLI，可以直接从 Bluemix 上下载二进制的包：[https://openwhisk.ng.bluemix.net/cli/go/download/](https://openwhisk.ng.bluemix.net/cli/go/download/)

然后将命令加到环境变量中：

```
$ chmod +x ./wsk

$ sudo mv wsk /usr/local/bin
```

### 为客户端获取密钥

接着，我们需要到我们的 vagrant 虚拟机，为客户端分配一下密钥。使用下面的命令登录：

```
vagrant ssh
```

然后，获取密钥：

```
$ wsk property get --auth

whisk auth		23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
```

### 在客户端设置

先看一下命令：

```
wsk property set --apihost http://192.168.33.13:10001 --namespace guest --auth 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
```

正常情况下 apihost 应该是 **192.168.33.13**，并且没有 10001 端口。但是好像我的配置有问题，2333。

可以先试试使用能不能列出系统的包：

```
$ wsk package list /whisk.system

packages
/whisk.system/github                                                   shared
/whisk.system/combinators                                              shared
/whisk.system/slack                                                    shared
/whisk.system/watson-textToSpeech                                      shared
/whisk.system/utils                                                    shared
/whisk.system/watson-speechToText                                      shared
/whisk.system/websocket                                                shared
/whisk.system/weather                                                  shared
/whisk.system/samples                                                  shared
/whisk.system/watson-translator                                        shared
```

接着，就可以进入下一步了。使用 Node.js 创建一个 hello, world。

### OpenWhisk Node.js Hello, world

1.创建我们的 hello.js

```
function main() {
   return {payload: 'Hello world'};
}
```

2.创建操作

```
$ wsk action create hello hello.js

ok: created action hello
```

3.触发事件

```
$ wsk action invoke hello

ok: invoked /guest/hello with id a3ea5f68844248e9aa5f68844288e98d
```

4.查看返回结果

```
wsk activation result a3ea5f68844248e9aa5f68844288e98d
```

就这么简单。


### OpenWhisk Node.js 传递参数

接下来，让我们看一个参数的例子：

```
function main(params) {
  return {
    payload:  'Hello, ' + params.name
  };
}
```

然后更新我们的操作：

```
$ wsk action update hello hello.js

ok: updated action hello
```

接着，就可以触发我们的操作：

```
$  wsk action invoke --result hello --param name Phodal

{
    "payload": "Hello, Phodal"
}
```

当然，它可以探索的地方仍然有很多。


