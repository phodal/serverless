定时任务 CRON
===


```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-scheduled-cron -n scheduled-cron
```

```
serverless deploy
```

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


```
serverless logs -f  cron -t
```

日志：

```
2017-11-01 16:41:14.112 (+08:00)	6b33ad33-bee0-11e7-9439-23daa7bb59a8	Your cron function "scheduled-cron-dev-cron" ran at Wed Nov 01 2017 08:41:14 GMT+0000 (UTC)
END RequestId: 6b33ad33-bee0-11e7-9439-23daa7bb59a8
REPORT RequestId: 6b33ad33-bee0-11e7-9439-23daa7bb59a8	Duration: 0.86 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 20 MB

START RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2 Version: $LATEST
2017-11-01 16:42:13.724 (+08:00)	8ea1a80f-bee0-11e7-a0c9-331175998dc2	Your cron function "scheduled-cron-dev-cron" ran at Wed Nov 01 2017 08:42:13 GMT+0000 (UTC)
END RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2
REPORT RequestId: 8ea1a80f-bee0-11e7-a0c9-331175998dc2	Duration: 4.08 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 20 MB
```
