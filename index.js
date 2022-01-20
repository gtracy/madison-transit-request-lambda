'use strict';

const _ = require('underscore');

const config = require('./config');
const logger = require('pino')(config.getLogConfig());

let AWS = require('aws-sdk');
const { SageMakerFeatureStoreRuntime } = require('aws-sdk');
AWS.config.update(config.getAWSConfig())

// messageAttributes = {
//   devKey: {}
//   stopid: {}
//   api: {}
//   request_url: {}
// }
exports.handler = async function(event, context) {

    for( let i=0; i < event.Records.length; i++ ) {
        let record = event.Records[i];

        const { body } = record;
        const { messageAttributes } = record;

        let message_attributes = _.map(messageAttributes, (obj,key) => {
            return {
                [key] : obj.stringValue
            }
        });
        await putDynamo(message_attributes);
    }
    return {};
}

async function putDynamo(message_attributes) {
    console.dir(message_attributes);

    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    var params = {
        TableName: config.getTableName(),
        Item: { }
    };
    message_attributes.forEach((attr) => {
        let key = Object.keys(attr)[0];
        params.Item[key] = {S:attr[key]};
    });

    try {
        let result = await ddb.putItem(params).promise();
        logger.info(result);
        return;
    } catch (err) {
        logger.error(err);
        return;
    }

}

