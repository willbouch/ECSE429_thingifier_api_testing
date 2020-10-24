const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');

chai.use(chaiHttp);

describe('Test for projects endpoints', function() {
    const host = 'http://localhost:4567';
    let server;
    const defaultProjectsObject = {
        projects: [
            {
                id: "1",
                title: "Office Work",
                completed: "false",
                active: "false",
                description: "",
                tasks: [
                    {
                        id: "1"
                    },
                    {
                        id: "2"
                    }
                ]
            }
        ]
    }

    const defaultTodosObject = {
        todos: [
            {
                id: '1',
                title: 'scan paperwork',
                doneStatus: false,
                description: '',
                tasksof: [
                    {
                        id: '1'
                    }
                ],
                categories: [
                    {
                        id: '1'
                    }
                ]
            },
            {
                id: '2',
                title: 'file paperwork',
                doneStatus: false,
                description: '',
                tasksof: [
                    {
                        id: '1'
                    }
                ]
            }
        ]
    };

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
        }
    });
    //passes, sometimes fails
    it('GET /projects: should get all projects', async function () {
        const id = 1;
        const res = await chai.request(host).get('/projects');
        const defobj = defaultProjectsObject.projects.find(e => e.id == id);
        expect(res).to.have.status(200);
        const idsort = {
            ...defobj, 
            tasks : defobj.tasks.sort((a,b) => a.id-b.id)
        }
        expect(res.body.projects[0]).to.deep.include(idsort);
        expect(res.body.projects.length).to.equal(defaultProjectsObject.projects.length);
    });
    //passes
    it('HEAD /projects: should return headers for all the instances of projects', async function () {
        const res = await chai.request(host).head('/projects');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });
    //passes
    it('POST /projects: should create project without a ID using the field values in the body of the message', async function () {
        const body = {
            title: 'Some title',
            description: 'Some description',
        };
        const res = await chai.request(host).post('/projects').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include(body);
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length + 1);
    });

    //passes, sometimes fails
    it('GET /projects/:id: should get project with specific id', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/projects/${id}`);
        const defobj = defaultProjectsObject.projects.find(e => e.id == id);
        expect(res).to.have.status(200);
        const idsort = {
            ...defobj, 
            tasks : defobj.tasks.sort((a,b) => a.id-b.id)
        }
        expect(res.body.projects[0]).to.deep.include(idsort);
    });
    //passes
    it('HEAD /projects/:id: should return headers for a specific instances of project using a id', async function () {
        const res = await chai.request(host).head('/projects/1');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });
    //passes
    it('POST /projects/:id: should change the title property of a specific project', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultProjectsObject.projects.find(e => e.id == id),
            title: body.title
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });
    //passes only somtimes, dont know how to fix
    it('POST /projects/:id: should change the description property of a specific project', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const defobj = defaultProjectsObject.projects.find(e => e.id == id);
        const res = await chai.request(host).post(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defobj, 
            description: body.description
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });
    //passes
    it('POST /projects/:id: should change all properties of a specific project', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultProjectsObject.projects.find(e => e.id == id),
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });
    //FAIL bug, description does not update without title, also assrtion error
    it('PUT /projects/:id: should change the title property of a specific project - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        await chai.request(host).post(`/projects/${id}`).send({ description: 'Some description' });
        const res = await chai.request(host).put(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultProjectsObject.projects.find(e => e.id == id),
            title: body.title,
            description: ''
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });
    //Title gets overwritten to nothing, assertion error
    it('PUT /projects/:id: should change the description property of a specific project - BUG', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultProjectsObject.projects.find(e => e.id == id),
            description: body.description
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });
    //assertion error
    it.only('PUT /projects/:id: should change all properties of a specific project - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultProjectsObject.projects.find(e => e.id == id),
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });
    //passes
    it('DELETE /projects/:id: should delete specific project', async function () {
        const id = 1;
        const res = await chai.request(host).delete(`/projects/${id}`);
        expect(res).to.have.status(200);
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length - 1);
    });
    //passes
    it('DELETE /projects/:id: should not delete specific project if unexisting id', async function () {
        const id = 10;
        const res = await chai.request(host).delete(`/projects/${id}`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find any instances with projects/${id}`] });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });

    //Double check tests after this point
    it('GET /projects/:id/categories: should return all the category items related to project, with given id', async function () {
        const id = 1;
        await chai.request(host).post(`/projects/${id}/categories`).send({ id: '1' });
        const res = await chai.request(host).get(`/projects/${id}/categories`);
        expect(res).to.have.status(200);
        expect(res.body.categories.length).to.be.greaterThan(0);
    });
    //passes
    it('HEAD /projects/:id/categories: should return headers for the category items related to project, with given id', async function () {
        const res = await chai.request(host).head('/projects/1/categories');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });
    //passes
    it('POST /projects/:id/categories: create an instance of a relationship named categories between project instance - BUG', async function () {
        const projectId = 1;
        const categoryId = 1;
        const body = {
            id: categoryId.toString()
        };
        const postRes = await chai.request(host).post(`/projects/${projectId}/categories`).send({ id: categoryId.toString() });
        const res = await chai.request(host).get(`/projects/${projectId}/categories`);
        expect(res).to.have.status(200);

        expect(postRes).to.have.status(201);
        expect(res.body.categories.length).to.be.greaterThan(0);
    });
    //passes
    it('DELETE /projects/:id/categories/:id: should delete the relationship between project and category', async function () {
        const projectId = 1;
        const categoryId = 1;
        const postRes = await chai.request(host).post(`/projects/${projectId}/categories`).send({ id: categoryId.toString() });
        const deleteRes = await chai.request(host).delete(`/projects/${projectId}/categories/${categoryId}`);
        const res = await chai.request(host).get(`/projects/${projectId}/categories`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(deleteRes).to.have.status(200);
        expect(res.body.categories).to.be.empty
    });
    // passes 
    it('GET /projects/:id/tasks: should return all the todo items related to project', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/projects/${id}/tasks`);
        expect(res).to.have.status(200);
        expect((await chai.request(host).get('/projects/1/tasks')).body.todos.length).equal(2);
    });
    //passes
    it('HEAD /projects/:id/tasks: headers for the todo items related to project, with given id, by the relationship named tasks', async function () {
        const res = await chai.request(host).head('/projects/1/tasks');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });
    //fail gives taskId 2 
    it('POST /projects/:id/tasks: should create a relationship named tasks between project instance - BUG', async function () {
        const taskId = 1;
        const projectId = 1;
        const body = {
            id: taskId.toString()
        };
        await chai.request(host).delete(`/projects/${projectId}/tasks/${taskId}`);
        const postRes = await chai.request(host).post(`/projects/${projectId}/tasks`).send(body);
        const res = await chai.request(host).get(`/projects/${projectId}/tasks`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        // expect(res.body.todos[0].id).to.deep.equal("2");
        expect(res.body.todos[0].id).to.deep.equal(taskId.toString());
    });
    //passes
    it('DELETE /projects/:id/tasks/:id: should delete the instance of the relationship named tasks between project and todo using the :id', async function () {
        const taskId = 1;
        const projectId = 1;
        const deleteRes = await chai.request(host).delete(`/projects/${projectId}/tasks/${taskId}`);
        const res = await chai.request(host).get(`/projects/${projectId}/tasks`);
        expect(res).to.have.status(200);
        expect(deleteRes).to.have.status(200);
        expect((await chai.request(host).get('/projects/1/tasks')).body.todos.length).equal(1);
    });

});