const { Given, When, Then } = require('cucumber');
const { runServer, convertToObjects, getIdsOnly } = require('./helper');
const {
    getFromTitle,
    getFromId,
    getAll,
    updateOne,
    updateMultiple,
    createOne,
    createMultiple,
    deleteOne,
    createOneRelationship,
    createMultipleRelationships,
    deleteOneRelationship,
    deleteMultipleRelationships
} = require('./api_helper');

const { expect } = require('chai');

const unexistingId = 123456789;

let resBody;

// GIVEN

Given('the system is running on localhost and is clean', async function () {
    await runServer();
});

Given('tasks with the following details are created:', async function (rawTasks) {
    const todos = convertToObjects(rawTasks);
    await createMultiple('todos', todos);
});

Given('category with title {string} and description {string} is created', async function (categoryTitle, categoryDescription) {
    await createOne('categories', { title: categoryTitle, description: categoryDescription });
});

Given('category with title {string} is created', async function (categoryTitle) {
    await createOne('categories', { title: categoryTitle });
});

Given('task with title {string} and description {string} is created', async function (taskTitle, taskDescription) {
    await createOne('todos', { title: taskTitle, description: taskDescription });
});

Given('task with title {string} has doneStatus {string}', async function (taskTitle, doneStatus) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    expect(todo.doneStatus).to.equal(doneStatus);
});

Given('task with title {string} already has doneStatus {string}', async function (taskTitle, doneStatus) {
    let todos = await getFromTitle('todos', taskTitle);
    const todoIds = getIdsOnly(todos);
    await updateMultiple('todos', todoIds, { doneStatus: true });
    todos = await getFromTitle('todos', taskTitle);
    todos.forEach(todo => {
        expect(todo.doneStatus).to.equal(doneStatus);
    });
});

Given('courses with the following details are created:', async function (rawProjects) {
    const projects = convertToObjects(rawProjects);
    await createMultiple('projects', projects);
});

Given('previously created tasks are categorized as {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    await createMultipleRelationships('todos', todoIds, 'categories', { id: category.id.toString() })
});

Given('previously created tasks are added to class todo list {string}', async function (projectTitle) {
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    const project = (await getFromTitle('projects', projectTitle))[0];
    await createMultipleRelationships('todos', todoIds, 'tasksof', { id: project.id.toString() })
});

// WHEN

When('student categorizes existing tasks with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    await createMultipleRelationships('todos', todoIds, 'categories', { id: category.id.toString() });
});

When('student categorizes existing task with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    await createOneRelationship('todos', todos[0].id, 'categories', category.id.toString())
});

When('student creates an instance of relationship between a task and unexisting category', async function () {
    const todos = await getAll('todos');
    resBody = await createOneRelationship('todos', todos[0].id, 'categories', { id: unexistingId.toString() });
});

When('student creates an instance of relationship for unexisting task', async function () {
    resBody = await createOneRelationship('todos', unexistingId, 'categories', {});
});

When('student changes the task description to {string}', async function (newTaskDescription) {
    const todos = await getAll('todos');
    await updateOne('todos', todos[0].id, { description: newTaskDescription });
});

When('student changes description of a unexisting task with description {string}', async function (newTaskDescription) {
    resBody = await updateOne('todos', unexistingId, { description: newTaskDescription });
});

When('student marks task with title {string} as done', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    await updateOne('todos', todo.id, { doneStatus: true });
});

When('student marks a unexisting task as done', async function () {
    resBody = await updateOne('todos', unexistingId, { doneStatus: true });
});

When('student adds task with title {string} to class todo list', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const project = (await getAll('projects'))[0];
    await createOneRelationship('todos', todo.id, 'tasksof', { id: project.id })
});

When('student adds unexisting task to class todo list', async function () {
    const project = (await getAll('projects'))[0];
    resBody = await createOneRelationship('todos', unexistingId, 'tasksof', { id: project.id.toString() })
});

When('student removes previous categorization with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    await deleteMultipleRelationships('todos', todoIds, 'categories', category.id);
});

When('student recategorizes existing tasks with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    await createMultipleRelationships('todos', todoIds, 'categories', { id: category.id.toString() });
});

When('student adjusts priority of unexisting task', async function () {
    const category = (await getAll('categories'))[0];
    resBody = await createOneRelationship('todos', unexistingId, 'categories', { id: category.id.toString() })
});

When('student removes task with title {string} from class {string}', async function (taskTitle, projectTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const project = (await getFromTitle('projects', projectTitle))[0];
    await deleteOneRelationship('todos', todo.id, 'tasksof', project.id);
});

When('student removes unexisting task to class todo list', async function () {
    const project = (await getAll('projects'))[0];
    resBody = await deleteOneRelationship('todos', unexistingId, 'tasksof', { id: project.id.toString() })
});

When('course to do list with title {string} and description {string} is created', async function (projectTitle, projectDescription) {
    await createOne('projects', { title: projectTitle, description: projectDescription });
});

When('course with title {string} is removed', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    await deleteOne('projects', project.id);
});

When('student changes course with title {string} to be inactive', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    await updateOne('projects', project.id, { active: false });
});

When('student removes unexistent course', async function () {
    resBody = await deleteOne('projects', unexistingId)
});

When('student replaces the existing task with title {string} with a new description {string}', async function (taskTitle, taskDescription) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    await createOne('todos', { title: taskTitle, description: taskDescription });
    await deleteOne('todos', todo.id);
});

// THEN

Then('the corresponding tasks should be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    todos.forEach(todo => {
        expect(todo.categories[0].id).to.equal(category.id);
    });
});

Then('the corresponding tasks should still be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    todos.forEach(todo => {
        expect(todo.categories[0].id).to.equal(category.id);
    });
});

Then('the corresponding task should be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    expect(todos[0].categories[0].id).to.equal(category.id);
});

Then('the system should send {string} as error message', async function (error) {
    expect(resBody.errorMessages[0]).to.contain(error);
});

Then('the corresponding task should have the new description {string}', async function (newTaskDescription) {
    const todos = await getAll('todos');
    expect(todos[0].description).to.equal(newTaskDescription);
});

Then('task with title {string} will be marked as done', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    expect(todo.doneStatus).to.equal('true');
});

Then('task with title {string} should still be marked as done', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    expect(todo.doneStatus).to.equal('true');
});

Then('class todo list should have task with title {string}', async function (taskTitle) {
    const project = (await getAll('projects'))[0];
    const todo = await getFromId('todos', project.tasks[0].id);
    expect(todo.title).to.equal(taskTitle);
});

Then('the corresponding tasks should no longer be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    expect(todos[0].categories).to.not.contain(category.id)
});

Then('class {string} should no longer have task with title {string}', async function (projectTitle, taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const project = (await getFromTitle('projects', projectTitle))[0];
    expect(project.tasks).to.not.contain(todo.id);
});

Then('corresponding course todo list with title {string} should be created', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    expect(project).to.not.be.undefined;
});

Then('corresponding course with title {string} should be removed', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    expect(project).to.be.undefined;
});

Then('the corresponding course with title {string} should be inactive', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    expect(project.active).equal('false');
});

Then('the old task should be removed and a new one with a new description {string} should exist', async function (taskDescription) {
    const todos = await getAll('todos');
    expect(todos).to.have.lengthOf(1);
    expect(todos[0].description).to.be.equal(taskDescription);
});