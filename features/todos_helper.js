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
    // BUGGY
    await chai.request(host).post(`/categories/${category.id}/todos`).send({id: todoId.toString()});
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

const getTodo = async todoId => {
    const res = await chai.request(host).get(`/todos/${todoId}`);
    return res.body.todos[0];
};

const getTodos = async () => {
    const res = await chai.request(host).get(`/todos`);
    return res.body.todos;
};

const getTodosFromCategory = async (categoryId) => {
    const res = await chai.request(host).get(`/categories/${categoryId}/todos`);
    return res.body.todos;
};

const updateTodo = async (todoId, updates) => {
    const res = await chai.request(host).post(`/todos/${todoId}`).send(updates);
    return res.body;
};

const updateTodos = async (todoIds, updates) => {
    for (const todoId of todoIds) {
        await updateTodo(todoId, updates);
    }
};

const getTodosFromTitle = async title => {
    formattedTitle = title.replace(' ', '+')
    const res = await chai.request(host).get(`/todos?title=${title}`);
    return res.body.todos;
};

const getIncompleteTodosFromProject = async projectId => {
    const res = await chai.request(host).get(`/projects/${projectId}/tasks?doneStatus=false`);
    return res.body.todos;
};

const assignTodoToCategory = async (todoId, category) => {
    const todo = todoId.toString();
    const res = await chai.request(host).post(`/categories/${category}/todos`).send(todo);
    return res.body;
};

const assignTodosToCategory = async (todoIds, category) => {
    for (const todoId of todoIds) {
        await categorizeTodo(todoId, category);
    }
};


module.exports = {
    createTodo: createTodo,
    createTodos: createTodos,
    categorizeTodo: categorizeTodo,
    categorizeTodos: categorizeTodos,
    getTodo: getTodo,
    getTodos: getTodos,
    getTodosFromCategory: getTodosFromCategory,
    updateTodo: updateTodo,
    getTodosFromTitle: getTodosFromTitle,
    updateTodos: updateTodos,
    addTodoToProject: addTodoToProject,
    uncategorizeTodos: uncategorizeTodos,
    uncategorizeTodo: uncategorizeTodo,
    addTodosToProject: addTodosToProject,
    removeTodoFromProject: removeTodoFromProject,
    getIncompleteTodosFromProject :getIncompleteTodosFromProject,
    assignTodoToCategory: assignTodoToCategory,
    assignTodosToCategory: assignTodosToCategory,
    deleteTodo: deleteTodo
};
