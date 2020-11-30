const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');
const Stopwatch = require('statman-stopwatch');
const osu = require('node-os-utils');
const mem = osu.mem;
const cpu = osu.cpu;
const {
    createOne,
    updateOne,
    deleteOne,
    createMultiple
} = require('./api_helper');

chai.use(chaiHttp);

describe('Test for dynamic analysis', function () {
    const host = 'http://localhost:4567';
    const T1 = new Stopwatch();
    const T2 = new Stopwatch();

    beforeEach(async function () {
        T1.start();
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
    });

    afterEach(async function () {
        try {
            await chai.request(host).get('/shutdown');
        } catch (err) { }
        let serverDown = false;
        while (!serverDown) {
            try {
                await chai.request(host).get('/todos');
            } catch (err) {
                serverDown = true;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        const t1 = T1.stop();
        T1.reset();
        console.log(`T1: ${t1}`);
        console.log(`CPU Usage: ${(await cpu.usage())}`);
        console.log(`Free memory: ${(await mem.info()).freeMemPercentage}\n`);
    });

    ['todos', 'categories', 'projects'].forEach(name => {
        [1, 10, 100, 1000, 10000].forEach(number => {
            it(`POST /${name}: add one todo after adding ${number}`, async function () {
                await createMultiple(name, number);
                T2.start();
                const res = await createOne(name);
                const t2 = T2.stop();
                T2.reset();
                console.log(`T2: ${t2}`);
                expect(res.api).to.include(res.internal);
            });

            it(`POST /${name}/:id: update one todo after adding ${number}`, async function () {
                await createMultiple(name, number);
                T2.start();
                const res = await updateOne(name);
                const t2 = T2.stop();
                T2.reset();
                console.log(`T2: ${t2}`);
                expect(res.api).to.include(res.internal);
            });

            it(`DELETE /${name}/:id: delete one todo after adding ${number}`, async function () {
                await createMultiple(name, number);
                T2.start();
                await deleteOne(name);
                const t2 = T2.stop();
                T2.reset();
                console.log(`T2: ${t2}`);
                // expect(updated).to.include(validationTodoUpdate); part to figure out
            });
        });
    });
});