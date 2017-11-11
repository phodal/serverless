Express + React 实现 Serverless 的服务端渲染
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
