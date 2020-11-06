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

const deleteTodo = async (todoId) => {
    const res = await chai.request(host).delete(`/todos/${todoId}`);
    return res.body;
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

const uncategorizeTodo = async (todoId, categoryId) => {
    await chai.request(host).delete(`/todos/${todoId}/categories/${categoryId}`);
};

const uncategorizeTodos = async (todoIds, categoryId) => {
    for (const todoId of todoIds) {
        await uncategorizeTodo(todoId, categoryId);
    }
};

const addTodoToProject = async (todoId, project) => {
    const res = await chai.request(host).post(`/todos/${todoId}/tasksof`).send(project);
    return res.body;
};

const addTodosToProject = async (todoIds, project) => {
    for (const todoId of todoIds) {
        await addTodoToProject(todoId, project);
    }
};

const removeTodoFromProject = async (todoId, projectId) => {
    const res = await chai.request(host).delete(`/todos/${todoId}/tasksof/${projectId}`);
    return res.body;
};


module.exports = {
    createTodo: createTodo,
    createTodos: createTodos,
    categorizeTodo: categorizeTodo,
    categorizeTodos: categorizeTodos,
    addTodoToProject: addTodoToProject,
    uncategorizeTodos: uncategorizeTodos,
    uncategorizeTodo: uncategorizeTodo,
    addTodosToProject: addTodosToProject,
    removeTodoFromProject: removeTodoFromProject,
    deleteTodo: deleteTodo
};
