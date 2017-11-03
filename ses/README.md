AWS-SES-Serverless-Example
============================

[![serverless](https://img.shields.io/badge/serverless-v1.10.1-yellow.svg)](http://www.serverless.com)

This repo is an example of sending email using SES on Lambda invocation. It uses the AWS SES nodeJS SDK to send emails. Various parameters for sending email such as **sourceEmail** address, **destination** email address can be specified as **body parameter** for the Deployed APIGateway URL.

### Technical Architecture:
![Architecture diagram](https://raw.githubusercontent.com/lakshmantgld/aws-ses-serverless-example/master/readmeFiles/architecture.png)

### Notes on AWS SES
- If you are in **SES sandbox**, you have to **verify both sender and receiver email addresses**. But, If you have migrated out of SES sandbox, sender mail alone must be verified.
- Best practice is to use IAM roles compared to hardcoding AWS credentials in application. For the IAM roles related to **SES**, take a look at the [sesIAMRole](https://github.com/lakshmantgld/aws-ses-serverless-example/tree/sesIAMRole) branch.

### Instructions to deploy:
- Clone this repo:
```
git clone https://github.com/lakshmantgld/aws-ses-serverless-example.git
```

- Install the dependencies:
```
cd aws-ses-serverless-example && yarn install or npm install
```

- Set the AWS credentials as environment variables like described below:
```
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=<region>
AWS_ACCESS_KEY_ID=<access-key>
```
The above credentials are required for deploying the **Lambda** and **APIGateway** using **serverless**

- Rename the ```config.copy.json``` to ```config.json```.

- Fill the above AWS credentials to **config.json**. As SES uses this credentials to send mail. Presently, SES supports only in **US East, US West & EU(Ireland)**. So, If your region is not supported by SES, make sure you select the above regions and add it to the **config.json**.

- Finally, deploy the app by running ```sls deploy -v```.

- Once the deployment completes, you can send mail by invoking the URL with the following parameters.

```js
{
	"bccEmailAddresses": [],
	"ccEmailAddresses": [],
	"toEmailAddresses": ["****@gmail.com"],
	"bodyData": "Hey test message buddy!! From AWS SES",
	"bodyCharset": "UTF-8",
	"subjectdata": "AWS SES",
	"subjectCharset": "UTF-8",
	"sourceEmail": "****@gmail.com",
	"replyToAddresses": ["****@gmail.com"]
}
```

Here is the picture of similar invocation made in postman:
![Post parameters](https://raw.githubusercontent.com/lakshmantgld/aws-ses-serverless-example/master/readmeFiles/postmanScreenshot.png)
