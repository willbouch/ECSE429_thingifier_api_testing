const { Given } = require('cucumber');
const { runServer } = require('./helper');

Given('the system is running on localhost and is clean', async function () {
    await runServer();
});
