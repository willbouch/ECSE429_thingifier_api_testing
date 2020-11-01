const { Given, When, Then } = require('cucumber');
const { createTodo, getTodo, updateTodo } = require('../todos_helper');
const { expect } = require('chai');

let createdTodo;

Given('task with title {string} and description {string} is created', async function (taskTitle, taskDescription) {
    createdTodo = await createTodo({ title: taskTitle, description: taskDescription });
});

When('student changes the task description to {string}', async function (newTaskDescription) {
    await updateTodo(createdTodo, { description: newTaskDescription });
});

Then('the corresponding task should have the new description {string}', async function (newTaskDescription) {
    const todo = await getTodo(createdTodo);
    expect(todo.description).to.equal(newTaskDescription);
});
