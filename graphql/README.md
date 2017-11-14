


GraphQL hello, world
---

```
serverless create --template aws-nodejs --path graphql
```

按 GraqhQL.js 在 GitHub 的示例：

```
yarn add graphql
```

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


配置：

```

functions:
  query:
    handler: handler.query
    events:
      - http:
          path: query
          method: get
```


Deploy:

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

查询：

```
$ curl -G https://5ol2v4lnx3.execute-api.us-east-1.amazonaws.com/dev/query --data-urlencode 'query={ hello }'


{"data":{"hello":"world"}}
```

更复杂的示例
---

> 一个GraphQL查询可以包含一个或者多个操作（operation），类似于一个RESTful API。操作（operation）可以使两种类型：查询（Query）或者修改（mutation）

```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-graphql-api-with-dynamodb -n graphql-dynamodb
```

部署：


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

```
$ curl -G 'https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query={greeting(firstName: "world")}'

{"data":{"greeting":"Hello, world."}}
```

修改

```
$ curl -G 'https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query=mutation {changeNickname(firstName: "world", nickname: "phodal")}'

{"data":{"changeNickname":"phodal"}}
```

```
$ curl -G 'https://jzlqq3fgfd.execute-api.us-east-1.amazonaws.com/dev/query' --data-urlencode 'query={greeting(firstName: "world")}'

{"data":{"greeting":"Hello, phodal."}}
```