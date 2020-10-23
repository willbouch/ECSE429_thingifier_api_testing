const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const child_process = require('child_process');
const exec = require('child_process').exec;

chai.use(chaiHttp);

describe('Test for categories endpoints', function () {
    const host = 'http://localhost:4567';
    let server;

    const defaultCategoriesObject = {
        categories: [
            {
                id: '1',
                title: 'Office',
                description: ''
            },
            {
                id: '2',
                title: 'Home',
                description: ''
            }
        ]
    }

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

    /*
    * The following two tests are curl requests tests. We do two simple requests to show that the API can correctly respond to such requests.
    */
    it('GET /todos: should get all todos when making the request with cURL', async function () {
        const command = "curl -i -X GET \
        http://localhost:4567/categories"
        child = exec(command, function(error, stdout, stderr){
            expect(stdout.toString()).to.include('200 OK');
        });
    });

    it('DELETE /todos/:id: should delete specific todo when making the request with cURL', async function () {
        const command = "curl -i -X DELETE \
        http://localhost:4567/categories/1"

        child = exec(command, function(error, stdout, stderr){
            expect(stdout.toString()).to.include('200 OK');
        });
    });

    it('GET /categories: should get all categories', async function () {
        const res = await chai.request(host).get('/categories');
        expect(res).to.have.status(200);
        expect(res.body.categories.length).to.equal(defaultCategoriesObject.categories.length);
        expect(res.body.categories.sort((a, b) => a.id - b.id)).to.deep.equal(defaultCategoriesObject.categories);
    });

    it('GET /categories: should get all categories with filter on the title', async function () {
        const res = await chai.request(host).get('/categories?title=Home');
        expect(res).to.have.status(200);
        expect(res.body.categories.length).to.equal(1);
    });

    it('GET /categories: should get no categories when filtering with unexisting title', async function () {
        const res = await chai.request(host).get('/categories?title=whatever');
        expect(res).to.have.status(200);
        expect(res.body.categories.length).to.equal(0);
    });

    it('POST /categories: should create a valid category with all information', async function () {
        const body = {
            title: 'Some title',
            description: 'Some description',
        };
        const res = await chai.request(host).post('/categories').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include(body);
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length + 1);
    });

    it('POST /categories: should create a valid category with all information in XML format', async function () {
        const body = `
            <category>
                <title>Some title</title>
                <description>Some description</description>
            </category>
        `;
        const res = await chai.request(host).post('/categories').set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include({
            title: 'Some title',
            description: 'Some description',
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length + 1);
    });

    it('POST /categories: should create a valid category with only title', async function () {
        const body = {
            title: 'Some title',
        }
        const res = await chai.request(host).post('/categories').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include(body);
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length + 1);
    });

    it('POST /categories: should create a valid category with only title in XML format', async function () {
        const body = `
            <todo>
                <title>Some title</title>
            </todo>
        `;
        const res = await chai.request(host).post('/categories').set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(201);
        expect(res.body).to.deep.include({
            title: 'Some title'
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length + 1);
    });

    it('POST /categories: should throw error when creating category without title', async function () {
        const body = {
            description: 'Some description'
        };
        const res = await chai.request(host).post('/categories').send(body);
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ errorMessages: ['title : field is mandatory'] })
    });

    it('HEAD /categories: should return headers for all the instances of category', async function () {
        const res = await chai.request(host).head('/categories');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('GET /categories/:id: should get category with specific id', async function () {
        const id = 1;
        const res = await chai.request(host).get(`/categories/${id}`);
        expect(res).to.have.status(200);
        expect(res.body.categories[0]).to.deep.include(defaultCategoriesObject.categories.find(e => e.id == id));
    });

    it('GET /categories/:id: fail to get category with unexisting id', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/categories/${id}`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find an instance with categories/${id}`] });
    });

    it('POST /categories/:id: should change the title property of a specific category', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/categories/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            title: body.title
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('POST /categories/:id: should change the title property of a specific category in XML format', async function () {
        const body = `
            <category>
                <title>Some title - Changed</title>
            </category>
        `;
        const id = 1;
        const res = await chai.request(host).post(`/categories/${id}`).set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            title: 'Some title - Changed'
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('POST /categories/:id: should change the description property of a specific category', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/categories/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            description: body.description
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('POST /categories/:id: should change the description property of a specific category in XML format', async function () {
        const body = `
            <category>
                <description>Some description - Changed</description>
            </category>
        `;
        const id = 1;
        const res = await chai.request(host).post(`/categories/${id}`).set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            description: 'Some description - Changed'
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('POST /categories/:id: should change all properties of a specific category', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).post(`/categories/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('PUT /categories/:id: should change the title property of a specific category - BUG', async function () {
        const body = {
            title: 'Some title - Changed',
        };
        const id = 1;
        await chai.request(host).post(`/categories/${id}`).send({ description: 'Some description' });
        const res = await chai.request(host).put(`/categories/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            title: body.title,
            description: 'Some description'
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);

        // FAILURE - Resets content of the entire category
    });

    it('PUT /categories/:id: should change the title property of a specific category - BUG', async function () {
        const body = {
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/categories/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            title: body.title
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);

        // FAILURE - Title is not suppose to be mandatory
    });

    it('PUT /categories/:id: should change the description property of a specific category in XML format - BUG', async function () {
        const body = `
            <category>
                <description>Some description - Changed</description>
            </category>
        `;
        const id = 1;
        const res = await chai.request(host).put(`/categories/${id}`).set('content-type', 'application/xml').send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            description: 'Some description - Changed'
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);

        // FAILURE - Title is not suppose to be mandatory
    });

    it('PUT /categories/:id: should change all properties of a specific category', async function () {
        const body = {
            title: 'Some title - Changed',
            description: 'Some description - Changed',
        };
        const id = 1;
        const res = await chai.request(host).put(`/categories/${id}`).send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
            ...defaultCategoriesObject.categories.find(e => e.id == id),
            title: body.title,
            description: body.description,
        });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('DELETE /categories/:id: should delete specific category', async function () {
        const id = 1;
        const res = await chai.request(host).delete(`/categories/${id}`);
        expect(res).to.have.status(200);
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length - 1);
    });

    it('DELETE /categories/:id: should not delete specific category if unexisting id', async function () {
        const id = 123;
        const res = await chai.request(host).delete(`/categories/${id}`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find any instances with categories/${id}`] });
        expect((await chai.request(host).get('/categories')).body.categories.length).equal(defaultCategoriesObject.categories.length);
    });

    it('HEAD /categories/:id: should return headers for a specific instances of category using a id', async function () {
        const res = await chai.request(host).head('/categories/1');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('GET /categories/:id/projects: should get all the project items related to specific category', async function () {
        const id = 1;
        await chai.request(host).post(`/categories/${id}/projects`).send({ id: '1' });
        const res = await chai.request(host).get(`/categories/${id}/projects`);
        expect(res).to.have.status(200);
        expect(res.body.projects[0].id).to.deep.equal('1');
    });

    it('GET /categories/:id/projects: should not get all related project items related to unexisting category - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/categories/${id}/projects`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find related projects for instance with categories/${id}`] });

        // FAILURE - Should not be returning any information except an error message
    });

    it('POST /categories/:id/projects: should create a relationship between specific category and project', async function () {
        const categoryId = 1;
        const projectId = 1;
        const body = {
            id: projectId.toString()
        };
        const postRes = await chai.request(host).post(`/categories/${categoryId}/projects`).send(body);
        const res = await chai.request(host).get(`/categories/${categoryId}/projects`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(res.body.projects.length).to.be.greaterThan(0);
        expect(res.body.projects[0].id).to.deep.equal(projectId.toString());
    });

    it('POST /categories/:id/projects: should create a relationship between specific category and project if id given as number - BUG', async function () {
        const categoryId = 1;
        const projectId = 1;
        const body = {
            id: projectId
        };
        const postRes = await chai.request(host).post(`/categories/${categoryId}/projects`).send(body);
        const res = await chai.request(host).get(`/categories/${categoryId}/projects`);
        expect(res).to.have.status(200); todo
        expect(postRes).to.have.status(200);
        expect(res.body.projects.length).to.be.greaterThan(0);
        expect(res.body.projects[0].id).to.deep.equal(projectId.toString());

        // FAILURE - Should link to project even if the id is not a string (bad design)
    });

    it('HEAD /categories/:id/projects: should return headers for the project items related to category, with given id', async function () {
        const res = await chai.request(host).head('/categories/1/projects');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('DELETE /categories/:id/projects/:id: should delete relationship between specific category and project', async function () {
        const categoryId = 1;
        const projectId = 1;
        const postRes = await chai.request(host).post(`/categories/${categoryId}/projects`).send({ id: projectId.toString() });
        const deleteRes = await chai.request(host).delete(`/categories/${categoryId}/projects/${projectId}`);
        const res = await chai.request(host).get(`/categories/${categoryId}/projects`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(deleteRes).to.have.status(200);
        expect(res.body.projects).to.be.empty
    });

    it('GET /categories/:id/todos: should get all the todo items related to specific category', async function () {
        const id = 1;
        await chai.request(host).post(`/categories/${id}/todos`).send({ id: '1' });
        const res = await chai.request(host).get(`/categories/${id}/todos`);
        expect(res).to.have.status(200);
        expect(res.body.todos[0].id).to.deep.equal('1');
    });

    it('GET /categories/:id/todos: should not get all related todo items related to unexisting category - BUG', async function () {
        const id = 123;
        const res = await chai.request(host).get(`/categories/${id}/todos`);
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ errorMessages: [`Could not find related todos for instance with categories/${id}`] });

        // FAILURE - Should not be returning any information except an error message
    });

    it('POST /categories/:id/todos: should create a relationship between specific category and todo', async function () {
        const todoId = 1;
        const categoryId = 1;
        const body = {
            id: todoId.toString()
        };
        const postRes = await chai.request(host).post(`/categories/${categoryId}/todos`).send(body);
        const res = await chai.request(host).get(`/categories/${categoryId}/todos`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(res.body.todos.length).to.be.greaterThan(0);
        expect(res.body.todos[0].id).to.deep.equal(todoId.toString());
    });

    it('POST /todos/:id/categories: should create a relationship between specific category and todo if id given as number - BUG', async function () {
        const todoId = 1;
        const categoryId = 1;
        const body = {
            id: todoId
        };
        const postRes = await chai.request(host).post(`/categories/${categoryId}/todos`).send(body);
        const res = await chai.request(host).get(`/categories/${categoryId}/todos`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(200);
        expect(res.body.todos.length).to.be.greaterThan(0);
        expect(res.body.todos[0].id).to.deep.equal(todoId.toString());

        // FAILURE - Should link to project even if the id is not a string (bad design)
    });

    it('HEAD /categories/:id/todos: should return headers for the category items related to category, with given id', async function () {
        const res = await chai.request(host).head('/categories/1/todos');
        expect(res).to.have.status(200);
        expect(res.header).to.not.be.empty
    });

    it('DELETE /categories/:id/todos/:id: should delete relationship between specific category and todo', async function () {
        const todoId = 1;
        const categoryId = 1;
        const postRes = await chai.request(host).post(`/categories/${categoryId}/todos`).send({ id: todoId.toString() });
        const deleteRes = await chai.request(host).delete(`/categories/${categoryId}/todos/${todoId}`);
        const res = await chai.request(host).get(`/categories/${categoryId}/todos`);
        expect(res).to.have.status(200);
        expect(postRes).to.have.status(201);
        expect(deleteRes).to.have.status(200);
        expect(res.body.todos).to.be.empty
    });
});