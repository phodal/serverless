
```
yarn add --dev serverless-step-functions
```

```
plugins:
  - serverless-step-functions
```

```
....................................
Serverless: Stack update finished...
Service Information
service: hello-world
stage: dev
region: us-east-1
stack: hello-world-dev
api keys:
  None
endpoints:
functions:
  hello: hello-world-dev-hello
Serverless StepFunctions OutPuts
endpoints:
  GET - https://m5g5nktxgj.execute-api.us-east-1.amazonaws.com/dev/hello
```

```
region: us-west-2 # This region must support step functions.
```