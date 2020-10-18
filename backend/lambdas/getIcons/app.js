const Fuse = require("fuse.js");

module.exports.handler = async function (event, context) {
    let objectToReturn = {
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,PUT,GET,DELETE'
        },
        "statusCode": 200,
        "body": ""
    };
    
    if (!event.queryStringParameters || !event.queryStringParameters.keywords) {
        objectToReturn.statusCode = 500;
        objectToReturn.body = JSON.stringify({"error": "No keywords supplied"})
        return objectToReturn;
    }
    else if (event.queryStringParameters.frameworkIDs != undefined && typeof event.queryStringParameters.frameworkIDs == "string") {
        if (event.queryStringParameters.frameworkIDs.match('[^0-9,]')) {
            objectToReturn.statusCode = 500;
            objectToReturn.body = JSON.stringify({"error": "Invalid framework ID supplied"})
            return objectToReturn;
        }
    }
    let list = require("./icons.json");
    const options = {
        includeScore: true,
        shouldSort: true,
        threshold: 0.2,
        keys: ['id'],
        ignoreLocation: true
    };

    const fuse = new Fuse(list, options);

    let result = fuse.search(event.queryStringParameters.keywords);
    if (event.queryStringParameters.frameworkIDs != undefined) {
        let frameworkIDs = event.queryStringParameters.frameworkIDs.split(",");
        result = result.filter((value) => {return frameworkIDs.indexOf(value.item.frameworkID.toString()) != -1;});
    }
    objectToReturn.body = { items: JSON.stringify(result)};
    return objectToReturn;
}