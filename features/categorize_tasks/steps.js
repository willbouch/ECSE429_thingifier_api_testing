const { Given, When, Then } = require('cucumber');
const { convertToObjects } = require('../helper');
const {
    createTodo,
    createTodos,
    categorizeTodo,
    categorizeTodos,
    getTodo
} = require('../todos_helper');
const { createCategory } = require('../categories_helper');
const { expect } = require('chai');

const unexistingId = 123456789;

let createdTodo;
let createdTodos;
let createdCategory;
let resBody;

Given('tasks with the following details are created:', async function (rawTasks) {
    const todos = convertToObjects(rawTasks);
    createdTodos = await createTodos(todos);
});

Given('category with title {string} and description {string}', async function (categoryTitle, categoryDescription) {
    createdCategory = await createCategory({ title: categoryTitle, description: categoryDescription });
});

When('student creates an instance of relationship between tasks and priority category', async function () {
    await categorizeTodos(createdTodos, { id: createdCategory.toString() });
});

Then('the corresponding task should be categorized as {string}', async function (categoryTitle) {
    const todo = await getTodo(createdTodos[0]);
    expect(todo.categories[0].id).to.equal(createdCategory);
});

Given('task with title {string} is created', async function (taskTitle) {
    createdTodo = await createTodo({ title: taskTitle });
});

When('student creates an instance of relationship between tasks and unexisting category', async function () {
    resBody = await categorizeTodo(createdTodo, { id: unexistingId.toString() });
});

Then('the system should send {string} as error message', async function (error) {
    expect(resBody.errorMessages[0]).to.contain(error);
});

Given('category with title {string} is created', async function (categoryTitle) {
    createdCategory = await createCategory({ title: categoryTitle });
});

When('student creates an instance of relationship for unexisting task', async function () {
    resBody = await categorizeTodo(unexistingId, { id: createdCategory.toString() });
});