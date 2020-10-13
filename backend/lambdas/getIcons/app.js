const Fuse = require("fuse.js");

module.exports.handler = function (event, context) {
    let objectToReturn = {
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,PUT,GET,DELETE'
        },
        "statusCode": 200,
        "body": ""
    };
    
    if (!event.queryStringParameters.keywords) {
        objectToReturn.statusCode = 500;
        objectToReturn.body = JSON.stringify({"error": "No keywords supplied"})
        return objectToReturn;
    }
    else if (!isNaN(event.queryStringParameters.frameworkID) && event.queryStringParameters.frameworkID != 0) {
        objectToReturn.statusCode = 500;
        objectToReturn.body = JSON.stringify({"error": "Invalid framework ID supplied"})
        return objectToReturn;
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
    if (event.queryStringParameters.frameworkID != undefined) {
        result = result.filter((value) => {return value.item.frameworkID == event.queryStringParameters.frameworkID;});
    }
    objectToReturn.body = JSON.stringify(result);
    return objectToReturn;
}
console.log(module.exports.handler({queryStringParameters: { keywords: "font", frameworkID: 0 }}))
