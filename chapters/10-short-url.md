创建自己的 Serverless 短链服务
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

