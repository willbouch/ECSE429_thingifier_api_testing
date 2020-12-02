const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');
const Stopwatch = require('statman-stopwatch');
const osu = require('node-os-utils');
const mem = osu.mem;
const cpu = osu.cpu;
const converter = require('json-2-csv');
const fs = require('fs');
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
    const time = new Stopwatch();

    const csvInfo = [];
    let testIterator = 0;
    let idAcc;

    const names = ['todos', 'categories', 'projects'];
    const numbersOfObjects = [1, 5, 10, 50, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000, 50000];

    beforeEach(async function () {
        if (testIterator % numbersOfObjects.length === 0) {
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

            time.stop();
            time.reset();
            time.start();
            idAcc = 3;
            console.log(`\n\nEXPERIMENT ${testIterator / numbersOfObjects.length + 1}`);
        }
        T1.start();
        await chai.request(host).post('/admin/data/thingifier');
    });

    afterEach(async function () {
        if (testIterator % numbersOfObjects.length === numbersOfObjects.length - 1) {
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
        }

        const t1 = T1.stop();
        T1.reset();
        console.log(`T1: (${time.time()}) ${t1}\n\n`);
        // csvInfo[testIterator] = { ...csvInfo[testIterator], t1: t1 };
        testIterator++;
    });

    after(function () {
        converter.json2csv(csvInfo, (err, csv) => {
            if (err) {
                throw err;
            }
            fs.writeFileSync('dynamic-analysis.csv', csv);
        });
    });

    async function getCpuMem() {
        time.split();
        T1.split();
        const usage = await cpu.usage();
        const freeMem = (await mem.info()).freeMemMb;
        time.unsplit();
        T1.unsplit();
        return { cpu: usage, freeMem: freeMem };
    }

    names.forEach(name => {
        numbersOfObjects.forEach(number => {
            it(`POST /${name}: add one ${name} after adding ${number}`, async function () {
                await createMultiple(name, number);
                const infoBef = await getCpuMem();
                T2.start();
                const res = await createOne(name);
                const t2 = T2.stop();
                const t2Time = time.time();
                const infoAft = await getCpuMem();
                const memCpuTime = time.time();
                T2.reset();
                console.log(`T2: (${time.time()}) ${t2}`);
                expect(res.api).to.include(res.internal);
                csvInfo.push(
                    {
                        name: name,
                        number: number,
                        type: 'add',
                        t2: t2,
                        t2Time: t2Time,
                        cpu: Math.abs(infoAft.cpu - infoBef.cpu),
                        mem: Math.abs(infoAft.freeMem - infoBef.freeMem),
                        memCpuTime: memCpuTime
                    }
                );
            });
        });
    });

    names.forEach(name => {
        numbersOfObjects.forEach(number => {
            it(`POST /${name}/:id: update one ${name} after adding ${number}`, async function () {
                await createMultiple(name, number);
                const infoBef = await getCpuMem();
                T2.start();
                const res = await updateOne(name, idAcc);
                idAcc += number;
                const t2 = T2.stop();
                const t2Time = time.time();
                const infoAft = await getCpuMem();
                const memCpuTime = time.time();
                T2.reset();
                console.log(`T2: (${time.time()}) ${t2}`);
                expect(res.api).to.include(res.internal);
                csvInfo.push(
                    {
                        name: name,
                        number: number,
                        type: 'update',
                        t2: t2,
                        t2Time: t2Time,
                        cpu: Math.abs(infoAft.cpu - infoBef.cpu),
                        mem: Math.abs(infoAft.freeMem - infoBef.freeMem),
                        memCpuTime: memCpuTime
                    }
                );
            });
        });
    });

    names.forEach(name => {
        numbersOfObjects.forEach(number => {
            it(`DELETE /${name}/:id: delete one ${name} after adding ${number}`, async function () {
                await createMultiple(name, number);
                const infoBef = await getCpuMem();
                T2.start();
                const res = await deleteOne(name, idAcc);
                idAcc += number;
                const t2 = T2.stop();
                const t2Time = time.time();
                const infoAft = await getCpuMem();
                const memCpuTime = time.time();
                T2.reset();
                console.log(`T2: (${time.time()}) ${t2}`);
                expect(res).to.have.status(200);
                csvInfo.push(
                    {
                        name: name,
                        number: number,
                        type: 'delete',
                        t2: t2,
                        t2Time: t2Time,
                        cpu: Math.abs(infoAft.cpu - infoBef.cpu),
                        mem: Math.abs(infoAft.freeMem - infoBef.freeMem),
                        memCpuTime: memCpuTime
                    }
                );
            });
        });
    });
});