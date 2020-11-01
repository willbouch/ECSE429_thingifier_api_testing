const { Given, When, Then } = require('cucumber');
const { convertToObjects } = require('../helper');
const { createTodos, categorizeTodos, getTodo } = require('../todos_helper');
const { createCategory } = require('../categories_helper');
const { expect } = require('chai');

let createdTodos;
let createdCategory;

Given('tasks with the following details are created:', async function (rawTasks) {
    const tasks = convertToObjects(rawTasks);
    createdTodos = await createTodos(tasks);
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
