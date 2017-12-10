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
