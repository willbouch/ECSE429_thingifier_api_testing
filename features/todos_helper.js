const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const createTodo = async todo => {
    const res = await chai.request(host).post('/todos').send(todo);
    return res.body.id;
};

const createTodos = async todos => {
    const ids = [];
    for (const todo of todos) {
        const id = await createTodo(todo);
        ids.push(id);
    }
    return ids;
};

const categorizeTodo = async (todoId, category) => {
    const res = await chai.request(host).post(`/todos/${todoId}/categories`).send(category);
    return res.body;
};

const categorizeTodos = async (todoIds, category) => {
    for (const todoId of todoIds) {
        await categorizeTodo(todoId, category);
    }
};

const getTodo = async todoId => {
    const res = await chai.request(host).get(`/todos/${todoId}`);
    return res.body.todos[0];
};

const getTodos = async () => {
    const res = await chai.request(host).get(`/todos`);
    return res.body.todos;
};

const updateTodo = async (todoId, updates) => {
    await chai.request(host).post(`/todos/${todoId}`).send(updates);
};

module.exports = {
    createTodo: createTodo,
    createTodos: createTodos,
    categorizeTodo: categorizeTodo,
    categorizeTodos: categorizeTodos,
    getTodo: getTodo,
    getTodos: getTodos,
    updateTodo: updateTodo
};
