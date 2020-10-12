const AWS = require("aws-sdk");
// keywords frameworks fuzzyMatch iconStyle
module.exports.handler = async function (event, context) {
    event.queryStringParameters
    if (process.env.LAMBDA_TASK_ROOT) {
        var dynamodb = new AWS.DynamoDB();
    }
    else {
        console.log("Detected that function is being executed outside the lambda env. Setting DynamoDB endpoint to local container.")
        var dynamodb = new AWS.DynamoDB({ endpoint: "http://localhost:8000"});
    }
}

