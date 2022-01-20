'use strict';

let AWS = require('aws-sdk');
let config = require('./config');
AWS.config.update(config.getAWSConfig())
console.log("\nAWS config :");
console.dir(config.getAWSConfig());

(async () => {

    const TABLE_NAME = config.getTableName();

    // let's make sure the table has been created
    var params = {
        TableName : TABLE_NAME,
        KeySchema: [       
            { AttributeName: "devkey", KeyType: "HASH"},
            { AttributeName: "stopid", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [       
            { AttributeName: "devkey", AttributeType: "S" },
            { AttributeName: "stopid", AttributeType: "S" },
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 25
        }
    };
    let ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    let aws_result = await ddb.createTable(params, async (err, data) => {
        if (err) {
            if( !(err.code === "ResourceInUseException") ) {
                // totally fine if the table already exists. 
                // otherwise, exit.
                console.dir(err);
                process.exit(1);
            } else {
                console.error("... table " + TABLE_NAME + " already exists");
            }
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    })

})();

function getAWSConfig() {
    if( process.env.NODE_ENV === 'prod' ) {
        return {
            region : 'us-east-2',
            access_id : process.env.AWS_ACCESS_ID,
            access_secret : process.env.AWS_ACCESS_SECRET
        }
    } else {
        return {
            region : 'local',
            endpoint : 'http://localhost:8000'
        }
    }
}
