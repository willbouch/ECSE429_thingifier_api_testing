const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');

chai.use(chaiHttp);

describe('Test for additional endpoints (some undocumented)', function () {
    const host = 'http://localhost:4567';

    beforeEach(async function () {
        child_process.spawn(
            'java',
            ['-jar', 'runTodoManagerRestAPI-1.5.5.jar'],
        );
        let serverReady = false;
        while (!serverReady) {
            try {
                await chai.request(host).get('/todos');
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
    });

    it('GET /docs: should return the api docs in HTML', async function () {
        const res = await chai.request(host).get('/docs');
        expect(res).to.have.status(200);
        expect(res).to.be.html;
    });

    it('GET /gui: should return the gui in HTML', async function () {
        const res = await chai.request(host).get('/docs');
        expect(res).to.have.status(200);
        expect(res).to.be.html;
    });

    it('POST /admin/data/thingifier: should clear all data', async function () {
        await chai.request(host).post('/admin/data/thingifier');
        expect((await chai.request(host).get('/todos')).body.todos).to.be.empty;
        expect((await chai.request(host).get('/projects')).body.projects).to.be.empty;
        expect((await chai.request(host).get('/categories')).body.categories).to.be.empty;
    });

    it('GET /admin/query/categories: should get all categories', async function () {
        const res = await chai.request(host).get('/admin/query/categories');
        expect(res.body.categories).to.have.lengthOf(2);
    });

    it('GET /admin/query/todos: should get all todos', async function () {
        const res = await chai.request(host).get('/admin/query/todos');
        expect(res.body.todos).to.have.lengthOf(2);
    });

    it('GET /admin/query/projects: should get all projects', async function () {
        const res = await chai.request(host).get('/admin/query/projects');
        expect(res.body.projects).to.have.lengthOf(1);
    });
});