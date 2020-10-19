const { Console } = require('console');
const getIcons = require('../backend/lambdas/getIcons/app');

test('getIcons: Call with invalid framework ID', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "font", frameworkIDs: "font" } });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("Invalid framework ID supplied");
});

test('getIcons: Call with (another) invalid framework ID', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "font", frameworkIDs: "666dd" } });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("Invalid framework ID supplied");
});

test('getIcons: Call with no framework ID', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "font" } });
    expect(icons.statusCode).toEqual(200);
    expect(JSON.parse(JSON.parse(icons.body).items)[0].item.className).toBeDefined();
});

test('getIcons: Call with a valid framework ID', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "font", frameworkIDs: "0" } });
    expect(icons.statusCode).toEqual(200);
    let iconsList = JSON.parse(JSON.parse(icons.body).items);
    expect(iconsList[0].item.className).toBeDefined();
    for (let icon = 0; icon < iconsList.length; icon++) {
        expect(iconsList[icon].item.frameworkID).toEqual(0);
    }
    expect(JSON.parse(icons.body).frameworkURLs).toContain("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/");
});

test('getIcons: Call with multiple frameworkIDs', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "font", frameworkIDs: "0,2" } });
    expect(icons.statusCode).toEqual(200);
    let iconsList = JSON.parse(JSON.parse(icons.body).items);
    expect(iconsList[0].item.className).toBeDefined();
    let includedFrameworks = [];
    for (let icon = 0; icon < iconsList.length; icon++) {
        expect(["0", "2"].indexOf(iconsList[icon].item.frameworkID.toString()) != -1).toBeTruthy();
        if (includedFrameworks.indexOf(iconsList[icon].item.frameworkID.toString()) == -1) {
            includedFrameworks.push(iconsList[icon].item.frameworkID.toString());
        }
    }
    expect(includedFrameworks).toContain("0");
    expect(includedFrameworks).toContain("2");
    expect(JSON.parse(icons.body).frameworkURLs).toContain("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/");
    expect(JSON.parse(icons.body).frameworkURLs).toContain("http://cdn.materialdesignicons.com/");
});

test('getIcons: Call with null queryStringParameters', async () => {
    let icons = await getIcons.handler({ queryStringParameters: null });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("No keywords supplied");
});

test('getIcons: Call with empty keywords parameter', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "" } });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("No keywords supplied");
});

test('getIcons: Call with extended search enabled', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "asymmetrik|autoprefixer", frameworkIDs: "0", extendedSearch: true } });
    expect(icons.statusCode).toEqual(200);
    expect(JSON.parse(icons.body.items).length).toEqual(2);
});

test('getIcons: Call with fuzzy search enabled', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "autoprefixer", frameworkIDs: "0", fuzzySearch: true } });
    expect(icons.statusCode).toEqual(200);
    expect(JSON.parse(icons.body.items).length).toBeGreaterThan(2);
});

test('getIcons: Call with fuzzy search and extended search enabled', async () => {
    let icons = await getIcons.handler({ queryStringParameters: { keywords: "asymmetrik|autoprefixer", frameworkIDs: "0", extendedSearch: true, fuzzySearch: true } });
    expect(icons.statusCode).toEqual(200);
    expect(JSON.parse(icons.body.items).length).toBeGreaterThan(2);
});