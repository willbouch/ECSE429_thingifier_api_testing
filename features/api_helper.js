const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const getFromTitle = async (option, title) => {
    formattedTitle = title.replace(' ', '+')
    const res = await chai.request(host).get(`/${option}?title=${title}`);
    return res.body[option];
};

const getFromId = async (option, id) => {
    const res = await chai.request(host).get(`/${option}/${id}`);
    return res.body[option][0];
};

const getAll = async option => {
    const res = await chai.request(host).get(`/${option}`);
    return res.body[option];
};

const getOneRelationship = async (option1, id, option2, queryParams) => {
    let formattedQuery = '';
    if (queryParams) {
        formattedQuery = '?';
        for (const queryParam in queryParams) {
            formattedQuery += `${queryParam}=${queryParams[queryParam]}&`;
        }
        formattedQuery = formattedQuery.substring(0, formattedQuery.length - 1);
    }
    const res = await chai.request(host).get(`/${option1}/${id}/${option2}${formattedQuery}`);
    return option2 === 'tasks' ? res.body.todos : res.body[option2];
};

const createOne = async (option, object) => {
    await chai.request(host).post(`/${option}`).send(object);
};

const createMultiple = async (option, objects) => {
    for (const object of objects) {
        await createOne(option, object);
    }
};

const updateOne = async (option, id, updates) => {
    const res = await chai.request(host).post(`/${option}/${id}`).send(updates);
    return res.body;
};

const updateMultiple = async (option, ids, updates) => {
    for (const id of ids) {
        await updateOne(option, id, updates);
    }
};

const deleteOne = async (option, id) => {
    const res = await chai.request(host).delete(`/${option}/${id}`);
    return res.body;
};

const createOneRelationship = async (option1, id1, option2, id2) => {
    const res = await chai.request(host).post(`/${option1}/${id1}/${option2}`).send({ id: id2.toString() });
    /*
    THIS IS SUPER HACKY AND SHOULD NOT BE NECESSARY
    The API has a bug when creating relationship. In fact, when linking a todo to a project,
    the link will be present at the todos level AND at the projects level REGARDLESS of which
    was linked to which. In other words, POST /todos/:id/tasksof with body { id: 'some id' }
    will have the same result as POST /projects/:id/tasks with body { id: 'some id' }

    This is not true for linking a todo to a category. So, if the user links a todo to a category,
    the relationship will be visible at the categories level but not at the todos level. In other
    words, POST /todos/:id/categories with body { id: 'some id' } will NOT have the same result as
    POST /categories/:id/todos with body { id: 'some id' }

    To address this problem, we will create the relationship on both ends if we are linking category
    and todo.
    */
    if ((option1 === 'todos' && option2 === 'categories') || (option1 === 'categories' && option2 === 'todos')) {
        await chai.request(host).post(`/${option2}/${id2}/${option1}`).send({ id: id1.toString() });
    }
    return res.body;
};

const createMultipleRelationships = async (option1, id1s, option2, id2) => {
    for (const id1 of id1s) {
        await createOneRelationship(option1, id1, option2, id2);
    }
};

const deleteOneRelationship = async (option1, id1, option2, id2) => {
    res = await chai.request(host).delete(`/${option1}/${id1}/${option2}/${id2}`);
    return res.body;
};

const deleteMultipleRelationships = async (option1, id1s, option2, id2) => {
    for (const id of id1s) {
        await deleteOneRelationship(option1, id, option2, id2);
    }
};

module.exports = {
    getFromTitle: getFromTitle,
    getFromId: getFromId,
    getAll: getAll,
    getOneRelationship: getOneRelationship,
    createOne: createOne,
    createMultiple: createMultiple,
    updateOne: updateOne,
    updateMultiple: updateMultiple,
    deleteOne: deleteOne,
    createOneRelationship: createOneRelationship,
    createMultipleRelationships: createMultipleRelationships,
    deleteOneRelationship: deleteOneRelationship,
    deleteMultipleRelationships: deleteMultipleRelationships,
};
