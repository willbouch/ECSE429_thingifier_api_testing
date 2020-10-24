const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');

chai.use(chaiHttp);

describe('Test for projects endpoints', function () {
    const host = 'http://localhost:4567';
    const defaultProjectsObject = {
        projects: [
            {
                id: '1',
                title: 'Office Work',
                completed: 'false',
                active: 'false',
                description: '',
                tasks: [
                    {
                        id: '1'
                    },
                    {
                        id: '2'
                    }
                ]
            }
        ]
    }

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

    /*
    * The following two tests are curl requests tests. We do two simple requests to show that the API can correctly respond to such requests.
    */
    it('GET /projects: should get all projects when making the request with cURL', async function () {
        const curlResult = child_process.execSync('curl -i -X GET http://localhost:4567/projects').toString('utf8');
        res = JSON.parse(curlResult.substr(curlResult.indexOf('{'), curlResult.length));
        expect(curlResult).to.deep.contain('200 OK');
        expect(res.projects.length).to.deep.equal(defaultProjectsObject.projects.length);
    });

    it('DELETE /projects/:id: should delete specific project when making the request with cURL', async function () {
        const curlResult = child_process.execSync('curl -i -X DELETE http://localhost:4567/projects/1').toString('utf8');
        expect(curlResult).to.deep.contain('200 OK');
        expect((await chai.request(host).get('/projects')).body.projects.length).to.deep.equal(defaultProjectsObject.projects.length - 1);
    });

    it('GET /projects: should get all projects', async function () {
        const res = await chai.request(host).get('/projects');
        expect(res).to.have.status(200);
        expect({
            ...res.body.projects[0],
            tasks: res.body.projects[0].tasks.sort((a, b) => a.id - b.id)
        }).to.deep.include(defaultProjectsObject.projects[0]);
        expect(res.body.projects.length).to.equal(defaultProjectsObject.projects.length);
    });

    it('GET /projects: should get all projects with filter on the title', async function () {
        const res = await chai.request(host).get('/projects?title=Office+Work');
        expect(res).to.have.status(200);
        expect(res.body.projects.length).to.equal(1);
    });

    it('GET /projects: should get no projects when filtering with unexisting title', async function () {
        const res = await chai.request(host).get('/projects?title=whatever');
        expect(res).to.have.status(200);
        expect(res.body.projects.length).to.equal(0);
    });

    it('GET /projects: should get all projects with filter on the completed', async function () {
        const res = await chai.request(host).get('/projects?completed=false');
        expect(res).to.have.status(200);
        expect(res.body.projects.length).to.equal(defaultProjectsObject.projects.length);
    });

    it('GET /projects: should get all projects with filter on the active', async function () {
        const res = await chai.request(host).get('/projects?active=false');
        expect(res).to.have.status(200);
        expect(res.body.projects.length).to.equal(defaultProjectsObject.projects.length);
    });

    it('GET /projects: should get all projects when filtering with unexisting property', async function () {
        const res = await chai.request(host).get('/projects?x=x');
        expect(res).to.have.status(200);
        expect(res.body.projects.length).to.equal(defaultProjectsObject.projects.length);
    });

    it('HEAD /projects: should return headers for all the instances of projects', async function () {
        const res = await chai.request(host).head('/projects');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('POST /projects: should create valid project with all information', async function () {
        const body = {
            title: 'Some title',
            description: 'Some description',
            active: true,
            completed: true,
        };
        const res = await chai.request(host).post('/projects').send(body);
        expect(res).to.have.status(201);
        expect({
            ...res.body,
            active: !!res.body.active,
            completed: !!res.body.completed
        }).to.deep.include(body);
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length + 1);
    });

    it('POST /projects: should create a valid project with all information in XML format', async function () {
        const body = `
            <project>
                <title>Some title</title>
                <description>Some description</description>
                <active>true</active>
                <completed>true</completed>
            </project>
        `;
        const res = await chai.request(host).post('/projects').set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include({
            title: 'Some title',
            description: 'Some description',
            active: 'true',
            completed: 'true'
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length + 1);
    });

    it('POST /projects: should create a valid project with only title', async function () {
        const body = {
            title: 'Some title',
        }
        const res = await chai.request(host).post('/projects').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include(body);
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length + 1);
    });

    it('POST /projects: should create a valid project with only title in XML format', async function () {
        const body = `
            <project>
                <title>Some title</title>
            </project>
        `;
        const res = await chai.request(host).post('/projects').set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include({
            title: 'Some title'
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length + 1);
    });

    it('POST /projects: should create a valid project with only description', async function () {
        const body = {
            description: 'Some description'
        };
        const res = await chai.request(host).post('/projects').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include(body);
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length + 1);
    });

    it('HEAD /projects: should return headers for all the instances of project', async function () {
        const res = await chai.request(host).head('/projects');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('GET /projects/:id: should get project with specific id', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/projects/${id}`);
        expect(res).to.have.status(200);
        expect({
            ...res.body.projects[0],
            tasks: res.body.projects[0].tasks.sort((a, b) => a.id - b.id)
        }).to.deep.include(defaultProjectsObject.projects[0]);;
    });

    it('GET /projects/:id: fail to get project with unexisting id', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/projects/${id}`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find an instance with projects/${id}`] });
    });

    it('POST /projects/:id: should change the title property of a specific project', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect({
            ...res.body,
            tasks: res.body.tasks.sort((a, b) => a.id - b.id)
        }).to.deep.equal({
            ...defaultProjectsObject.projects[0],
            title: body.title
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });

    it('POST /projects/:id: should change the title project of a specific category in XML format', async function () {
        const body = `
            <project>
                <title>Some title - Changed</title>
            </project>
        `;
        const id = 1;
        const res = await chai.request(host).post(`/projects/${id}`).set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(200);
        expect({
            ...res.body,
            tasks: res.body.tasks.sort((a, b) => a.id - b.id)
        }).to.deep.equal({
            ...defaultProjectsObject.projects[0],
            title: 'Some title - Changed'
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });

    it('POST /projects/:id: should change the description property of a specific project', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect({
            ...res.body,
            tasks: res.body.tasks.sort((a, b) => a.id - b.id)
        }).to.deep.equal({
            ...defaultProjectsObject.projects[0],
            description: body.description
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });

    it('POST /projects/:id: should change all properties of a specific project', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
            active: true,
            completed: true
        };
        const id = 1;
        const res = await chai.request(host).post(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);
        expect({
            ...res.body,
            tasks: res.body.tasks.sort((a, b) => a.id - b.id),
        }).to.deep.equal({
            ...defaultProjectsObject.projects[0],
            active: 'true',
            completed: 'true',
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });

    it('PUT /projects/:id: should change the title property of a specific project - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        await chai.request(host).post(`/projects/${id}`).send({ description: 'Some description' });
        const res = await chai.request(host).put(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);

        /* FAILURE - Resets content of the entire project
        Comparing the body of the response to the initial data will flag that all tasks were removed. This
        is unexpected behaviour since not documented in the API.
        */
    });

    it('PUT /projects/:id: should change the description property of a specific project - BUG', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);

        /* FAILURE - Resets content of the entire project
        Comparing the body of the response to the initial data will flag that all tasks were removed and title was resetted.
        This is unexpected behaviour since not documented in the API.
        */
    });

    it('PUT /projects/:id: should change all properties of a specific project - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
            completed: true,
            active: true
        };
        const id = 1;
        const res = await chai.request(host).put(`/projects/${id}`).send(body);
        expect(res).to.have.status(200);

        /* FAILURE - Resets content of the entire project
        Comparing the body of the response to the initial data will flag that all tasks were removed.
        This is unexpected behaviour since not documented in the API.
        */
    });

    it('DELETE /projects/:id: should delete specific project', async function () {
        const id = 1;
        const res = await chai.request(host).delete(`/projects/${id}`);
        expect(res).to.have.status(200);
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length - 1);
    });

    it('DELETE /projects/:id: should not delete specific project if unexisting id', async function () {
        const id = 10;
        const res = await chai.request(host).delete(`/projects/${id}`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find any instances with projects/${id}`] });
        expect((await chai.request(host).get('/projects')).body.projects.length).equal(defaultProjectsObject.projects.length);
    });

    it('HEAD /projects/:id: should return headers for a specific instances of project using a id', async function () {
        const res = await chai.request(host).head('/projects/1');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('GET /projects/:id/categories: should return all the category items related to project, with given id', async function () {
        const id = 1;
        await chai.request(host).post(`/projects/${id}/categories`).send({ id: '1' });
        const res = await chai.request(host).get(`/projects/${id}/categories`);
        expect(res).to.have.status(200);
        expect(res.body.categories.length).to.be.greaterThan(0);
    });

    it('GET /projects/:id/categories: should not get all related category items related to unexisting project - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/projects/${id}/categories`);
        expect(res).to.have.status(200);

        /* FAILURE - Should not be returning any information except an error message
        Getting the categories of an unexisting project should throw an error. If this is not a bug, this is a bad
        design decision since the user should be informed that the id given in the request corresponds to no
        existing todo. Should return a 404.
        */
    });

    it('POST /projects/:id/categories: create an instance of a relationship named categories between project instance', async function () {
        const projectId = 1;
        const categoryId = 1;
        const body = {
            id: categoryId.toString()
        };
        const postRes = await chai.request(host).post(`/projects/${projectId}/categories`).send(body);
        const res = await chai.request(host).get(`/projects/${projectId}/categories`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(res.body.categories.length).to.be.greaterThan(0);
        expect(res.body.categories[0].id).to.deep.equal(projectId.toString());
    });

    it('POST /projects/:id/categories: should create a relationship between specific category and project if id given as number - BUG', async function () {
        const projectId = 1;
        const categoryId = 1;
        const body = {
            id: categoryId
        };
        const postRes = await chai.request(host).post(`/projects/${projectId}/categories`).send(body);
        expect(postRes).to.have.status(404);

        /* FAILURE - Should link to category even if the id is not a string (bad design)
        This, from a client perspective can be considered a bug. There is no good reason why a numerical id should be
        inputted as a string for it to work. Either update the documentation of the API, or accept both format (number and string)
        Should return a 201.
        */
    });

    it('HEAD /projects/:id/categories: should return headers for the category items related to project, with given id', async function () {
        const res = await chai.request(host).head('/projects/1/categories');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

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

    it('GET /projects/:id/tasks: should return all the todo items related to project - BUG', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/projects/${id}/tasks`);
        expect(res).to.have.status(200);

        /* FAILURE - Relationship should be called tasks
        Based on the documentation, the array of todos should be called tasks instead of todos.
        */
    });

    it('GET /projects/:id/tasks: should not get all related todo items related to unexisting project - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/projects/${id}/tasks`);
        expect(res).to.have.status(200);

        /* FAILURE - Should not be returning any information except an error message
        Getting the todos of an unexisting project should throw an error. If this is not a bug, this is a bad
        design decision since the user should be informed that the id given in the request corresponds to no
        existing todo. Should return a 404.
        */
    });

    it('POST /projects/:id/tasks: should create a relationship named tasks between project instance - BUG', async function () {
        const taskId = 1;
        const projectId = 1;
        const body = {
            id: taskId.toString()
        };
        await chai.request(host).delete(`/projects/${projectId}/tasks/${taskId}`);
        await chai.request(host).delete(`/projects/${projectId}/tasks/2`);
        const postRes = await chai.request(host).post(`/projects/${projectId}/tasks`).send(body);
        const res = await chai.request(host).get(`/projects/${projectId}/tasks`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(res.body.todos.length).to.be.greaterThan(0);
        expect(res.body.todos[0].id).to.deep.equal(taskId.toString());
    });

    it('DELETE /projects/:id/tasks/:id: should delete the instance of the relationship named tasks between project and todo using the :id', async function () {
        const taskId = 1;
        const projectId = 1;
        const deleteRes = await chai.request(host).delete(`/projects/${projectId}/tasks/${taskId}`);
        const res = await chai.request(host).get(`/projects/${projectId}/tasks`);
        expect(res).to.have.status(200);
        expect(deleteRes).to.have.status(200);
        expect((await chai.request(host).get('/projects/1/tasks')).body.todos.length).equal(1);
    });

    it('HEAD /projects/:id/tasks: headers for the todo items related to project, with given id, by the relationship named tasks', async function () {
        const res = await chai.request(host).head('/projects/1/tasks');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });
});