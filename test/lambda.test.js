const { Console } = require('console');
const getIcons = require('../backend/lambdas/getIcons/app');

test('getIcons: Call with invalid framework ID', async () => {
    let icons = await getIcons.handler({ body: '{ "keywords": "font", "frameworkIDs": "font" }' });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("Invalid framework ID supplied");
});

test('getIcons: Call with (another) invalid framework ID', async () => {
    let icons = await getIcons.handler({ body: '{ "keywords": "font", "frameworkIDs": "666dd" }' });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("Invalid framework ID supplied");
});

test('getIcons: Call with no framework ID', async () => {
    let icons = await getIcons.handler({ body: '{ "keywords": "font" }' });
    expect(icons.statusCode).toEqual(200);
    expect(JSON.parse(icons.body)[0].item.className).toBeDefined();
});

test('getIcons: Call with a valid framework ID', async () => {
    let icons = await getIcons.handler({ body: '{ "keywords": "font", "frameworkIDs": "0" }' });
    expect(icons.statusCode).toEqual(200);
    let iconsList = JSON.parse(icons.body);
    expect(iconsList[0].item.className).toBeDefined();
    for (let icon = 0; icon < iconsList.length; icon++) {
        expect(iconsList[icon].item.frameworkID).toEqual(0);
    }
});

test('getIcons: Call with multiple frameworkIDs', async () => {
    let icons = await getIcons.handler({ body: '{ "keywords": "font", "frameworkIDs": "0,2" }' });
    expect(icons.statusCode).toEqual(200);
    let iconsList = JSON.parse(icons.body);
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
});

test('getIcons: Call with null queryStringParameters', async () => {
    let icons = await getIcons.handler({ body: null });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("No keywords supplied");
});

test('getIcons: Call with empty keywords parameter', async () => {
    let icons = await getIcons.handler({ body: '{ "keywords": "" }' });
    expect(icons.statusCode).toEqual(500);
    expect(JSON.parse(icons.body).error).toEqual("No keywords supplied");
});
