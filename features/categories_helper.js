const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const createCategory = async category => {
    const res = await chai.request(host).post('/categories').send(category);
    return res.body.id;
};

const createCategories = async categories => {
    const ids = [];
    for (const category of categories) {
        const id = await createCategory(category);
        ids.push(id);
    }
    return ids;
};

const getCategories = async () => {
    const res = await chai.request(host).get(`/categories`);
    return res.body.categories;
};

const getCategoriesFromTitle = async title => {
    formattedTitle = title.replace(' ', '+')
    const res = await chai.request(host).get(`/categories?title=${title}`);
    return res.body.categories;
};

const getIncompleteHighPriorityTodos = async categoryId => {
    const res = await chai.request(host).get(`/categories/${categoryId}/todos?doneStatus=false`);
    return res.body.todos;
    //working after a post http://localhost:4567/categories/2/todos?doneStatus=false
}

module.exports = {
    createCategory: createCategory,
    getCategoriesFromTitle: getCategoriesFromTitle,
    createCategories: createCategories,
    getCategories: getCategories,
    getIncompleteHighPriorityTodos: getIncompleteHighPriorityTodos
};
