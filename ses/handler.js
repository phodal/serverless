'use strict';

import AWS from 'aws-sdk';
import request from 'request';
import config from './config.json';

AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

let ses = new AWS.SES();

// The function to send SES email message
module.exports.sendMail = (event, context, callback) => {

  let bccEmailAddresses = event.body.bccEmailAddresses;
  let ccEmailAddresses = event.body.ccEmailAddresses;
  let toEmailAddresses = event.body.toEmailAddresses;
  let bodyData = event.body.bodyData;
  let bodyCharset = event.body.bodyCharset;
  let subjectdata = event.body.subjectdata;
  let subjectCharset = event.body.subjectCharset;
  let sourceEmail = event.body.sourceEmail;
  let replyToAddresses = event.body.replyToAddresses;

  var options = {
    text: 'We have got a customer support from ' + replyToAddresses + ' Log into <https://privateemail.com/appsuite/> to answer their query.',
  }

  let emailParams = {
    Destination: {
      BccAddresses: bccEmailAddresses,
      CcAddresses: ccEmailAddresses,
      ToAddresses: toEmailAddresses
    },
    Message: {
      Body: {
        Text: {
          Data: bodyData,
          Charset: bodyCharset
        }
      },
      Subject: {
        Data: subjectdata,
        Charset: subjectCharset
      }
    },
    Source: sourceEmail,
    ReplyToAddresses: replyToAddresses
  };

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Mail sent successfully'
    }),
  };

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
};
