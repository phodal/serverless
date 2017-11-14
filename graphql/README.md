


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

