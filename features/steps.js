const { Given, When, Then } = require('cucumber');
const { runServer, convertToObjects, getIdsOnly } = require('./helper');
const {
    createTodo,
    createTodos,
    updateTodo,
    updateTodos,
    categorizeTodo,
    categorizeTodos,
    getTodos,
    getTodosFromTitle
} = require('./todos_helper');
const {
    createCategory,
    getCategoriesFromTitle
} = require('./categories_helper');

const { expect } = require('chai');

const unexistingId = 123456789;

let resBody;

// GIVEN

Given('the system is running on localhost and is clean', async function () {
    await runServer();
});

Given('tasks with the following details are created:', async function (rawTasks) {
    const todos = convertToObjects(rawTasks);
    await createTodos(todos);
});

Given('category with title {string} and description {string} is created', async function (categoryTitle, categoryDescription) {
    await createCategory({ title: categoryTitle, description: categoryDescription });
});

Given('category with title {string} is created', async function (categoryTitle) {
    await createCategory({ title: categoryTitle });
});

Given('existing task is already categorized as {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    await categorizeTodo(todos[0].id, { id: category.id.toString() });
});

Given('task with title {string} and description {string} is created', async function (taskTitle, taskDescription) {
    await createTodo({ title: taskTitle, description: taskDescription });
});

Given('task with title {string} has doneStatus {string}', async function (taskTitle, doneStatus) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    expect(todo.doneStatus).to.equal(doneStatus);
});

Given('task with title {string} already has doneStatus {string}', async function (taskTitle, doneStatus) {
    let todos = await getTodosFromTitle(taskTitle);
    const todoIds = getIdsOnly(todos);
    await updateTodos(todoIds, { doneStatus: true });
    todos = await getTodosFromTitle(taskTitle);
    todos.forEach(todo => {
        expect(todo.doneStatus).to.equal(doneStatus);
    });
});

// WHEN

When('student categorizes existing tasks with priority {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    const todoIds = getIdsOnly(todos);
    await categorizeTodos(todoIds, { id: category.id.toString() });
});

When('student categorizes existing task with priority {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    await categorizeTodo(todos[0].id, category.id.toString())
});

When('student creates an instance of relationship between a task and unexisting category', async function () {
    const todos = await getTodos();
    resBody = await categorizeTodo(todos[0].id, { id: unexistingId.toString() });
});

When('student creates an instance of relationship for unexisting task', async function () {
    resBody = await categorizeTodo(unexistingId, {});
});

When('student changes the task description to {string}', async function (newTaskDescription) {
    const todos = await getTodos();
    await updateTodo(todos[0].id, { description: newTaskDescription });
});

When('student changes description of a unexisting task with description {string}', async function (newTaskDescription) {
    resBody = await updateTodo(unexistingId, { description: newTaskDescription });
});

When('student marks task with title {string} as done', async function (taskTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    await updateTodo(todo.id, { doneStatus: true });
});

When('student marks a unexisting task as done', async function () {
    await updateTodo(unexistingId, { doneStatus: true });
});

// THEN

Then('the corresponding tasks should be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    todos.forEach(todo => {
        expect(todo.categories[0].id).to.equal(category.id);
    });
});

Then('the corresponding task should be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    expect(todos[0].categories[0].id).to.equal(category.id);
});

Then('the system should send {string} as error message', async function (error) {
    expect(resBody.errorMessages[0]).to.contain(error);
});

Then('the corresponding task should have the new description {string}', async function (newTaskDescription) {
    const todos = await getTodos();
    expect(todos[0].description).to.equal(newTaskDescription);
});

Then('task with title {string} will be marked as done', async function (taskTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
});

Then('task with title {string} should still be marked as done', async function (taskTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    expect(todo.doneStatus).to.equal('true');
});