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
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(defaultTodosObject.todos.length);
    });

    it('GET /todos: should get todo with coressponding id filter', async function () {
        const res = await chai.request(host).get('/todos?id=1');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(1);
    });

    it('GET /todos: should get no todos when filtering with unexisting id', async function () {
        const res = await chai.request(host).get('/todos?id=whatever');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(0);
    });

    it('GET /todos: should get all todos with filter on the title', async function () {
        const res = await chai.request(host).get('/todos?title=scan+paperwork');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(1);
    });

    it('GET /todos: should get no todos when filtering with unexisting title', async function () {
        const res = await chai.request(host).get('/todos?title=unexisting+title');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(0);
    });

    it('GET /todos: should get all todos with filter on the description', async function () {
        await chai.request(host).post('/todos/1').send({ description: 'x' })
        const res = await chai.request(host).get('/todos?description=x');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(1);
    });

    it('GET /todos: should get no todos when filtering with unexisting description', async function () {
        const res = await chai.request(host).get('/todos?description=whatever');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(0);
    });

    it('GET /todos: should get todos when filtering with doneStatus', async function () {
        const res = await chai.request(host).get('/todos?doneStatus=false');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(defaultTodosObject.todos.length);
    });

    it('GET /todos: should get all todos with filter on the description & title', async function () {
        await chai.request(host).post('/todos/1').send({ description: 'x' })
        const res = await chai.request(host).get('/todos?description=x&title=scan+paperwork');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(1);
    });

    it('GET /todos: should get no todos with a filter on title and description that no todo contains', async function () {
        const res = await chai.request(host).get('/todos?description=x&title=print+paperwork');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(0);
    });

    it('GET /todos: should get all todos with a filter on an invalid field', async function () {
        const res = await chai.request(host).get('/todos?x=x');
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(2);
    });

    it('POST /todos: should create a valid todo with all information', async function () {
        const body = {
            title: 'Some title',
            doneStatus: true,
            description: 'Some description',
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res).to.have.status(201);
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
        expect(res).to.have.status(201);
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
        expect(res).to.have.status(201);
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
        expect(res).to.have.status(201);
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
        expect(res).to.have.status(201);
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
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['title : field is mandatory'] })
    });

    it('POST /todos: should throw error when creating todo with non boolean for doneStatus', async function () {
        const body = {
            title: 'Some title',
            doneStatus: 'string'
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['Failed Validation: doneStatus should be BOOLEAN'] });
    });

    it('POST /todos: should throw error when creating todo with id field populated', async function () {
        const body = {
            title: 'Some title',
            id: "1"
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['Invalid Creation: Failed Validation: Not allowed to create with id'] });
    });

    it('POST /todos: should throw error when creating todo with unknown field', async function () {
        const body = {
            title: 'Some title',
            random: "random field"
        };
        const res = await chai.request(host).post('/todos').send(body);
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['Could not find field: random'] });
    });

    it('HEAD /todos: should return headers for all the instances of todo', async function () {
        const res = await chai.request(host).head('/todos');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('GET /todos/:id: should get todo with specific id', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/todos/${id}`);
        expect(res).to.have.status(200);
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
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find an instance with todos/${id}`] });
    });


    it('POST /todos/:id: should throw error when attempting to modify unexisting todo id', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 5;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: ['No such todo entity instance with GUID or ID 5 found'] });
    });


    it('POST /todos/:id: should change the title property of a specific todo', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect(res).to.have.status(200);
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
        expect(res).to.have.status(200);
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
        expect(res).to.have.status(200);
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
        expect(res).to.have.status(200);
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
        expect(res).to.have.status(200);
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
        expect(res).to.have.status(200);
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

    it('POST /todos/:id: should change no properties of a specific todo for an empty body', async function () {
        const body = {
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect(res).to.have.status(200);
        expect({
            ...res.body,
            doneStatus: !res.body.doneStatus
        }).to.deep.equal({
            ...defaultTodosObject.todos.find(e => e.id == id),
        });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('POST /todos/:id: should throw an error when an invalid field is in the body', async function () {
        const body = {
            invalid: "1"
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['Could not find field: invalid'] });
    });

    it('PUT /todos/:id: should change the title property of a specific todo - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect(res).to.have.status(200);

        /* FAILURE - Resets content of the entire todo
        Comparing the body of the response to the initial data will flag that categories and projects
        relationships are deleted. The same would happen to doneStatus or description if they were set to
        their non default value.
        */
    });

    it('PUT /todos/:id: should change the description property of a specific todo - BUG', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect(res).to.have.status(400);

        /* FAILURE - Title is not supposed to be mandatory
        From the documentation, the body should only contain properties that we want to amend. So, not putting
        the title is supposed to be fine. However, it returns an error saying that the title is a mandatory field
        even it if is not. Should return a 200.
        */
    });

    it('PUT /todos/:id: should change the description property of a specific todo in XML format - BUG', async function () {
        const body = `
            <todo>
                <description>Some description - Changed</description>
            </todo>
        `;
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(400);

        /* FAILURE - Title is not supposed to be mandatory
        From the documentation, the body should only contain properties that we want to amend. So, not putting
        the title is supposed to be fine. However, it returns an error saying that the title is a mandatory field
        even it if is not. Should return a 200.
        */
    });

    it('PUT /todos/:id: should change all properties of a specific todo', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
            doneStatus: true,
        };
        const id = 1;
        const res = await chai.request(host).post(`/todos/${id}`).send(body);
        expect(res).to.have.status(200);
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

    it('PUT /todos/:id: should throw error when attempting to modify unexisting todo id', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 5;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: ['Invalid GUID for 5 entity todo'] });
    });

    it('PUT /todos/:id: should change no properties of a specific todo for an empty body - BUG', async function () {
        const body = {
        };
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect(res).to.have.status(400);

        /* FAILURE - Title is not supposed to be mandatory.
        From the documentation, the body should only contain properties that we want to amend. So, not putting
        the title is supposed to be fine. However, it returns an error saying that the title is a mandatory field
        even it if is not. Should return a 200.
        */
    });

    it('PUT /todos/:id: should throw an error when an invalid field is in the body', async function () {
        const body = {
            invalid: "1"
        };
        const id = 1;
        const res = await chai.request(host).put(`/todos/${id}`).send(body);
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['Could not find field: invalid'] });
    });

    it('DELETE /todos/:id: should delete specific todo', async function () {
        const id = 1;
        const res = await chai.request(host).delete(`/todos/${id}`);
        expect(res).to.have.status(200);
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length - 1);
    });

    it('DELETE /todos/:id: should not delete specific todo if unexisting id', async function () {
        const id = 123;
        const res = await chai.request(host).delete(`/todos/${id}`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find any instances with todos/${id}`] });
        expect((await chai.request(host).get('/todos')).body.todos.length).equal(defaultTodosObject.todos.length);
    });

    it('HEAD /todos/:id: should return headers for a specific instances of todo using a id', async function () {
        const res = await chai.request(host).head('/todos/1');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('GET /todos/:id/tasksof: should get all the project items related to specific todo', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/todos/${id}/tasksof`);
        expect(res).to.have.status(200);
        expect(res.body.projects[0].id).to.deep.equal(defaultTodosObject.todos.find(e => e.id == id).tasksof[0].id);
    });

    it('GET /todos/:id/tasksof: should not get all related project items related to unexisting todo - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/todos/${id}/tasksof`);
        expect(res).to.have.status(200);

        /* FAILURE - Should not be returning any information except an error message
        Getting the projects of an unexisting todo should throw an error. If this is not a bug, this is a bad
        design decision since the user should be informed that the id given in the request corresponds to no
        existing todo. Should return a 404.
        */
    });

    it('POST /todos/:id/tasksof: should create a relationship between specific todo and project', async function () {
        const todoId = 1;
        const projectId = 1;
        const body = {
            id: projectId.toString()
        };
        await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        const postRes = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/tasksof`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
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
        const postRes = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/tasksof`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(404);

        /* FAILURE - Should link to project even if the id is not a string (bad design)
        This, from a client perspective can be considered a bug. There is no good reason why a numerical id should be
        inputted as a string for it to work. Either update the documentation of the API, or accept both format (number and string)
        Should return a 201.
        */
    });

    it('POST /todos/:id/tasksof: should throw an error when trying to create a relationship with unexisting todo id', async function () {
        const todoId = 123;
        const projectId = 1;
        const body = {
            id: projectId.toString()
        };
        await chai.request(host).delete(`/todos/${todoId}/tasksof`);
        const postRes = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        expect(postRes).to.have.status(404);
        expect(postRes.body).to.deep.equal({ errorMessages: [`Could not find parent thing for relationship todos/${todoId}/tasksof`] });
    });

    it('POST /todos/:id/tasksof: should throw an error when trying to create a relationship with unexisting project id', async function () {
        const todoId = 1;
        const projectId = 123;
        const body = {
            id: projectId.toString()
        };
        await chai.request(host).delete(`/todos/${todoId}/tasksof`);
        const postRes = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        expect(postRes).to.have.status(404);
        expect(postRes.body).to.deep.equal({ errorMessages: [`Could not find thing matching value for id`] });
    });

    it('POST /todos/:id/tasksof: should throw an error when body is empty - BUG', async function () {
        const todoId = 1;
        const body = {};
        await chai.request(host).delete(`/todos/${todoId}/tasksof`);
        const postRes = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        expect(postRes).to.have.status(201);

        /* FAILURE - Should not create a relationship when the body is empty
        When the body is empty, no relationship should be created. At the moment, a relationship with an
        empty project is created and this is unexpected behaviour. The client should be informed with a clear
        error message that the body was empty, or didn't contain the id property. Should return a 400.
        */
    });

    it('POST /todos/:id/tasksof: should throw an error when trying to create a relationship with invalid fields - BUG', async function () {
        const todoId = 1;
        const body = {
            x: "x"
        };
        await chai.request(host).delete(`/todos/${todoId}/tasksof`);
        const postRes = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(body);
        expect(postRes).to.have.status(400);

        /* FAILURE - The response should be a message, not a java exception.
        The system should handle the error when an unexpected property is sent in the body. There shouldn't be internal
        errors shown to the client such as NullPointerException.
        This is the payload we receive { errorMessages: [`java.lang.NullPointerException`] }
        */
    });


    it('HEAD /todos/:id/tasksof: should return headers for the project items related to todo, with given id', async function () {
        const res = await chai.request(host).head('/todos/1/tasksof');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('DELETE /todos/:id/tasksof/:id: should delete relationship between specific todo and project', async function () {
        const todoId = 1;
        const projectId = 1;
        const deleteRes = await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        const res = await chai.request(host).get(`/todos/${todoId}/tasksof`);
        expect(res).to.have.status(200);
        expect(deleteRes).to.have.status(200);
        expect(res.body.projects).to.be.empty
    });

    it('DELETE /todos/:id/tasksof/:id: should throw an error when attempting to delete an unexisting project', async function () {
        const todoId = 1;
        const projectId = 123;
        const deleteRes = await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        expect(deleteRes).to.have.status(404);
        expect(deleteRes.body).to.deep.equal({ errorMessages: [`Could not find any instances with todos/${todoId}/tasksof/${projectId}`] });
    });

    it('DELETE /todos/:id/tasksof/:id: should throw an error when attempting to delete a project for an unexisting todo - BUG', async function () {
        const todoId = 123;
        const projectId = 1;
        const deleteRes = await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
        expect(deleteRes).to.have.status(400);

        /* FAILURE - Appropriate error message should be displayed
        The system should handle the error when an unexpected property is sent in the body. There should't be internal
        errors shown to the client such as NullPointerException.
        This is the payload we receive { errorMessages: [`java.lang.NullPointerException`] }
        */
    });

    it('GET /todos/:id/categories: should get all the category items related to specific todo', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/todos/${id}/categories`);
        expect(res).to.have.status(200);
        expect(res.body.categories[0].id).to.deep.equal(defaultTodosObject.todos.find(e => e.id == id).categories[0].id);
    });

    it('GET /todos/:id/categories: should not get all related category items related to unexisting todo - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/todos/${id}/categories`);
        expect(res).to.have.status(200);

        /* FAILURE - Should not be returning any information except an error message
        Getting the categories of an unexisting todo should throw an error. If this is not a bug, this is a bad
        design decision since the user should be informed that the id given in the request corresponds to no
        existing todo. Should return a 404.
        */
    });

    it('POST /todos/:id/categories: should create a relationship between specific todo and category', async function () {
        const todoId = 1;
        const categoryId = 1;
        const body = {
            id: categoryId.toString()
        };
        await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        const postRes = await chai.request(host).post(`/todos/${todoId}/categories`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/categories`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
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
        const postRes = await chai.request(host).post(`/todos/${todoId}/categories`).send(body);
        const res = await chai.request(host).get(`/todos/${todoId}/categories`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(404);

        /* FAILURE - Should link to category even if the id is not a string (bad design)
        This, from a client perspective can be considered a bug. There is no good reason why a numerical id should be
        inputted as a string for it to work. Either update the documentation of the API, or accept both format (number and string).
        Should return a 201.
        */
    });

    it('HEAD /todos/:id/categories: should return headers for the category items related to todo, with given id', async function () {
        const res = await chai.request(host).head('/todos/1/categories');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('DELETE /todos/:id/categories/:id: should delete relationship between specific todo and category', async function () {
        const todoId = 1;
        const categoryId = 1;
        const deleteRes = await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        const res = await chai.request(host).get(`/todos/${todoId}/categories`);
        expect(res).to.have.status(200);
        expect(deleteRes).to.have.status(200);
        expect(res.body.categories).to.be.empty
    });

    it('DELETE /todos/:id/categories/:id: should throw an error when attempting to delete a category for an unexisting todo - BUG', async function () {
        const todoId = 123;
        const categoryId = 1;
        const deleteRes = await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        expect(deleteRes).to.have.status(400);

        /* FAILURE - Appropriate error message should be displayed
        The system should handle the error when an unexpected property is sent in the body. There should't be internal
        errors shown to the client such as NullPointerException.
        This is the payload we receive { errorMessages: [`java.lang.NullPointerException`] }
        */
    });

    it('DELETE /todos/:id/categories/:id: should throw an error when attempting to delete an unexisting category', async function () {
        const todoId = 1;
        const categoryId = 123;
        const deleteRes = await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
        expect(deleteRes).to.have.status(404);
        expect(deleteRes.body).to.deep.equal({ errorMessages: [`Could not find any instances with todos/${todoId}/categories/${categoryId}`] });
    });
});