创建自己的 Serverless 短链服务
===


在想用 Serverless 可以做点什么简单的在线应用后，我想到了一个是在线短链生成服务。最后的结果见：[http://x.pho.im/](http://x.pho.im/)，一个非常简单的在线应用。

这里的代码基于：[https://github.com/vannio/serverless-shrink](https://github.com/vannio/serverless-shrink)。

因为上面的代码中，不能自动创建域名。然后，再针对数据库进行了一些优化。

代码逻辑
---

这里的代码逻辑比如简单：

 - 创建短链时，使用生成一个四位的字符串
 - 将原有的 URL 和生成的 URL 存储到 DynamoDB 中
 - 在返回的 HTML 中，输出对应的 URL
 - 重定向时，从 DynamoDB 读取对应的短链
 - 如果短链存在，则执行 302 重定向；如果不存在，则返回一个 404。

### 创建首页

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
