const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');
chai.use(chaiHttp);

const host = 'http://localhost:4567';

const convertToObjects = raw => {
    const rawData = raw.rawTable;
    const properties = rawData[0];
    rawData.shift();
    const objects = [];
    rawData.forEach(element => {
        let object = {};
        for (let i = 0; i < element.length; i++) {
            if (element[i] === 'false') {
                element[i] = false;
            } else if (element[i] === 'true') {
                element[i] = true;
            }
            object[properties[i]] = element[i];
        }
        objects.push(object);
    });
    return objects;
};

const runServer = async () => {
    let serverRunning = false;
    // Check if server is up
    try {
        await chai.request(host).post('/admin/data/thingifier');
        serverRunning = true;
    } catch (err) { }

    if (!serverRunning) {
        child_process.spawn(
            'java',
            ['-jar', 'runTodoManagerRestAPI-1.5.5.jar'],
        );

        let serverReady = false;
        while (!serverReady) {
            try {
                await chai.request(host).post('/admin/data/thingifier');
                serverReady = true;
            } catch (err) { }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    // Otherwise, server is running and clean
};

const shutdownServer = async () => {
    try {
        await chai.request(host).get('/shutdown');
    } catch (e) { }
};

const isServerUp = async () => {
    try {
        await chai.request(host).get('/docs');
        return true;
    } catch (e) {
        return false;
    }
};

const getIdsOnly = array => {
    const ids = array.reduce((prev, curr) => {
        const temp = prev;
        temp.push(curr.id);
        return temp;
    }, []);
    return ids;
};

module.exports = {
    convertToObjects: convertToObjects,
    runServer: runServer,
    isServerUp: isServerUp,
    shutdownServer: shutdownServer,
    getIdsOnly: getIdsOnly
};
