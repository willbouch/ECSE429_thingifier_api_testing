const { Given, When, Then } = require('cucumber');
const { convertToObjects, getIdsOnly } = require('../helper');
const {
    createTodo,
    createTodos,
    categorizeTodo,
    categorizeTodos,
    getTodo,
    getTodos,
} = require('../todos_helper');
const { createCategory, getCategoriesFromTitle } = require('../categories_helper');
const { expect } = require('chai');

const unexistingId = 123456789;

let resBody;

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

// ---

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

// ---

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
