const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');

chai.use(chaiHttp);

describe('Test for todos endpoints', function () {
    const host = 'http://localhost:4567';
    let server;

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
        server = child_process.spawn(
            'java',
            ['-jar', 'runTodoManagerRestAPI-1.5.5.jar'],
        );
        await new Promise(resolve => setTimeout(resolve, 300));
    });

    afterEach(async function () {
        server.kill();
        await new Promise(resolve => setTimeout(resolve, 300));
    });

    it('GET /todos: should get all todos', async function () {
        const res = await chai.request(host).get('/todos');
        expect(res.body.todos.length).to.equal(defaultTodosObject.todos.length);
    });

    it('GET /todos: should get all todos with filter on the title', async function () {
        const res = await chai.request(host).get('/todos?title=scan+paperwork');
        expect(res.body.todos.length).to.equal(1);
    });

    it('GET /todos: should get no todos when filtering with unexisting description', async function () {
        const res = await chai.request(host).get('/todos?description=whatever');
        expect(res.body.todos.length).to.equal(0);
    });

    it('GET /todos: should get todos when filtering with doneStatus', async function () {
        const res = await chai.request(host).get('/todos?doneStatus=false');
        expect(res.body.todos.length).to.equal(defaultTodosObject.todos.length);
    });

    it('POST /todos: should create a valid todo with all information', async function () {
        const body = {
            title: 'Some title',
            doneStatus: true,
            description: 'Some description',
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect({
            ...res.body,
            doneStatus: !!res.body.doneStatus
        }).to.deep.include({
            ...body
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length + 1);
    });

    it('POST /todos: should create a valid todo with all information in XML format', async function () {
        const body = `
            <todo>
                <doneStatus>false</doneStatus>
                <description>Some description</description>
                <title>Some title</title>
            </todo>
        `;
        const res = await chai.request(host).post('/todos').set('content-type', 'application/xml').send(body);
        expect({
            ...res.body,
            doneStatus: !!res.body.doneStatus
        }).to.deep.include({
            title: 'Some title',
            doneStatus: true,
            description: 'Some description',
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length + 1);
    });

    it('POST /todos: should create a valid todo with only title', async function () {
        const body = {
            title: 'Some title',
        }
        const res = await chai.request(host).post('/todos').send(body);
        expect({
            ...res.body,
        }).to.deep.include({
            ...body
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length + 1);
    });

    it('POST /todos: should create a valid todo with only title in XML format', async function () {
        const body = `
            <todo>
                <title>Some title</title>
            </todo>
        `;
        const res = await chai.request(host).post('/todos').set('content-type', 'application/xml').send(body);
        expect({
            ...res.body,
            doneStatus: !!res.body.doneStatus
        }).to.deep.include({
            title: 'Some title'
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length + 1);
    });

    it('POST /todos: should create a valid todo with only title and description', async function () {
        const body = {
            title: 'Some title',
            description: 'Some description'
        }
        const res = await chai.request(host).post('/todos').send(body);
        expect({
            ...res.body,
        }).to.deep.include({
            ...body
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length + 1);
    });

    it('POST /todos: should throw error when creating todo without title', async function () {
        const body = {
            description: 'Some description'
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res.body).to.deep.equal({ errorMessages: ['title : field is mandatory'] })
    });

    it('POST /todos: should throw error when creating todo with non boolean for doneStatus', async function () {
        const body = {
            title: 'Some title',
            doneStatus: 'true'
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res.body).to.deep.equal({ errorMessages: ['Failed Validation: doneStatus should be BOOLEAN'] });
    });

    it('POST /todos: should throw error when creating todo with non boolean for doneStatus', async function () {
        const body = {
            title: 'Some title',
            doneStatus: 'true'
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res.body).to.deep.equal({ errorMessages: ['Failed Validation: doneStatus should be BOOLEAN'] });
    });

    it('HEAD /todos: should return headers for all the instances of todo', async function () {
        const res = await chai.request(host).head('/todos');
        expect(res.header).to.not.be.empty
    });

    it('GET /todos/:id: should get todo with specific id', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/todos/${id}`);
        expect({
            ...res.body.todos[0],
            doneStatus: !!res.body.todos.doneStatus,
        }).to.deep.include({
            ...defaultTodosObject.todos.find(e => e.id == id),
        });
    });

    it('GET /todos/:id: fail to get todo with unexisting id', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/todos/${id}`);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find an instance with todos/${id}`] });
    });

    it('POST /todos/:id: should change the title property of a specific todo', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect({
            ...res.body,
            doneStatus: !res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            title: body.title
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('POST /todos/:id: should change the title property of a specific todo in XML format', async function () {
        const body = `
            <todo>
                <title>Some title - Changed</title>
            </todo>
        `;
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).set('content-type', 'application/xml').send(body);
        expect({
            ...res.body,
            doneStatus: !res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            title: 'Some title - Changed'
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('POST /todos/:id: should change the description property of a specific todo', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect({
            ...res.body,
            doneStatus: !res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            description: body.description
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });
    
    it('POST /todos/:id: should change the description property of a specific todo in XML format', async function () {
        const body = `
            <todo>
                <description>Some description - Changed</description>
            </todo>
        `;
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).set('content-type', 'application/xml').send(body);
        expect({
            ...res.body,
            doneStatus: !res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            description: 'Some description - Changed'
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('POST /todos/:id: should change the doneStatus property of a specific todo', async function () {
        const body = {
            doneStatus: true,
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect({
            ...res.body,
            doneStatus: !!res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            doneStatus: body.doneStatus
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('POST /todos/:id: should change all properties of a specific todo', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
            doneStatus: true,
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect({
            ...res.body,
            doneStatus: !!res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            doneStatus: body.doneStatus,
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('PUT /todos/:id: should change the title property of a specific todo - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect({
            ...res.body,
            doneStatus: !res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            title: body.title
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);

        // FAILURE - Resets content of the entire todo
    });

    it('PUT /todos/:id: should change the description property of a specific todo - BUG', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect({
            ...res.body,
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            description: body.description
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);

        // FAILURE - Title is not suppose to be mandatory
    });

    it.only('PUT /todos/:id: should change the description property of a specific todo in XML format - BUG', async function () {
        const body = `
            <todo>
                <description>Some description - Changed</description>
            </todo>
        `;
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).set('content-type', 'application/xml').send(body);
        expect({
            ...res.body,
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            description: 'Some description - Changed'
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);

        // FAILURE - Title is not suppose to be mandatory
    });

    it('PUT /todos/:id: should change all properties of a specific todo', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
            doneStatus: true,
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect({
            ...res.body,
            doneStatus: !!res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
            doneStatus: body.doneStatus,
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('DELETE /todos/:id: should delete specific todo', async function () {
        const id = 1;
        await chai.request(host).delete(`/todos/${id}`);
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length - 1);
    });

    it('DELETE /todos/:id: should not delete specific todo if unexisting id', async function () {
        const id = 123;
        const res = await chai.request(host).delete(`/todos/${id}`);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find any instances with todos/${id}`] });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('HEAD /todos/:id: should return headers for a specific instances of todo using a id', async function () {
        const res = await chai.request(host).head('/todos/1');
        expect(res.header).to.not.be.empty
    });

    it('GET /todos/:id/tasksof: should get all the project items related to specific todo', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/todos/${id}/tasksof`);
        expect(res.body.projects[0].id).to.deep.equal(defaultTodosObject.todos.find(e => e.id == id).tasksof[0].id);
    });

    it('GET /todos/:id/tasksof: should not get all related project items related to unexisting todo - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/todos/${id}/tasksof`);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find related projects for instance with todos/${id}`] });

        // FAILURE - Should not be returning any information except an error message
    });

    it('POST /todos/:id/tasksof: should create a relationship between specific todo and project', async function () {
        const todoId = 1;
        const projectId = 1;
        const body = {
            id: projectId.toString()
        };
        await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/tasksof`);
        expect(res.body.projects.length).to.be.greaterThan(0);
        expect(res.body.projects[0].id).to.deep.equal(projectId.toString());
    });

    it('POST /todos/:id/tasksof: should create a relationship between specific todo and project if id given as number - BUG', async function () {
        const todoId = 1;
        const projectId = 1;
        const body = {
            id: projectId
        };
        await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/tasksof`);
        expect(res.body.projects.length).to.be.greaterThan(0);
        expect(res.body.projects[0].id).to.deep.equal(projectId.toString());

        // FAILURE - Should link to project even if the id is not a string (bad design)
    });

    it('HEAD /todos/:id/tasksof: should return headers for the project items related to todo, with given id', async function () {
        const res = await chai.request(host).head('/todos/1/tasksof');
        expect(res.header).to.not.be.empty
    });

    it('DELETE /todos/:id/tasksof/:id: should delete relationship between specific todo and project', async function () {
        const todoId = 1;
        const projectId = 1;
        await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        const res = await chai.request(host).get(`/todos/${todoId}/tasksof`);
        expect(res.body.projects).to.be.empty
    });

    it('GET /todos/:id/categories: should get all the category items related to specific todo', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/todos/${id}/categories`);
        expect(res.body.categories[0].id).to.deep.equal(defaultTodosObject.todos.find(e => e.id == id).categories[0].id);
    });

    it('GET /todos/:id/categories: should not get all related category items related to unexisting todo - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/todos/${id}/categories`);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find related categories for instance with todos/${id}`] });

        // FAILURE - Should not be returning any information except an error message
    });

    it('POST /todos/:id/categories: should create a relationship between specific todo and category', async function () {
        const todoId = 1;
        const categoryId = 1;
        const body = {
            id: categoryId.toString()
        };
        await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        await chai.request(host).post(`/todos/${todoId}/categories`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/categories`);
        expect(res.body.categories.length).to.be.greaterThan(0);
        expect(res.body.categories[0].id).to.deep.equal(categoryId.toString());
    });

    it('POST /todos/:id/categories: should create a relationship between specific todo and category if id given as number - BUG', async function () {
        const todoId = 1;
        const categoryId = 1;
        const body = {
            id: categoryId
        };
        await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        await chai.request(host).post(`/todos/${todoId}/categories`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/categories`);
        expect(res.body.categories.length).to.be.greaterThan(0);
        expect(res.body.categories[0].id).to.deep.equal(categoryId.toString());

        // FAILURE - Should link to project even if the id is not a string (bad design)
    });

    it('HEAD /todos/:id/categories: should return headers for the category items related to todo, with given id', async function () {
        const res = await chai.request(host).head('/todos/1/categories');
        expect(res.header).to.not.be.empty
    });

    it('DELETE /todos/:id/categories/:id: should delete relationship between specific todo and category', async function () {
        const todoId = 1;
        const categoryId = 1;
        await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        const res = await chai.request(host).get(`/todos/${todoId}/categories`);
        expect(res.body.categories).to.be.empty
    });
});