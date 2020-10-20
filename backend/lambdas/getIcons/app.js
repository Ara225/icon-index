const Fuse = require("fuse.js");
let list = require("./icons.json");
let iconPacks = require("./iconPacks.json");

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
    let startNum = event.queryStringParameters.startNum ? event.queryStringParameters.startNum : 0;
    let totalResults = 0;
    const options = {
        includeScore: false,
        shouldSort: true,
        threshold: event.queryStringParameters.fuzzyMatch == "true" ? 0.6 : 0.2,
        keys: ['id'],
        ignoreLocation: true,
        useExtendedSearch: event.queryStringParameters.extendedSearch  == "true"
    };

    const fuse = new Fuse(list, options);

    let result = fuse.search(event.queryStringParameters.keywords);
    let frameworkURLs = [];
    // Filter results based on framework (if frameworkIDs query string param is provided)
    if (event.queryStringParameters.frameworkIDs != undefined) {
        let frameworkIDs = event.queryStringParameters.frameworkIDs.split(",");
        result = result.filter((value) => {
            if (frameworkIDs.indexOf(value.item.frameworkID.toString()) != -1) {
                // Get the URLs to load the packs that have icons in the returned object
                if (frameworkURLs.indexOf(iconPacks[value.item.frameworkID].url) == -1) {
                    frameworkURLs.push(iconPacks[value.item.frameworkID].url);
                }
                return true;
            }
        });
        totalResults = result.length;
        result = result.slice(startNum, 100);
    }
    else {
        totalResults = result.length;
        result = result.slice(startNum, 100);
        // Get the URLs to load the packs that have icons in the returned object
        for (let index = 0; index < result.length; index++) {
            if (frameworkURLs.indexOf(iconPacks[result[index].item.frameworkID].url) == -1) {
                frameworkURLs.push(iconPacks[result[index].item.frameworkID].url);
            }
        }
    }
    objectToReturn.body = JSON.stringify({ 
                                             items: JSON.stringify(result), 
                                             frameworkURLs: JSON.stringify(frameworkURLs),
                                             totalResults: totalResults,
                                             remainingResults: totalResults - (result.length + startNum),
                                             startNum: startNum
                                        });
    return objectToReturn;
}