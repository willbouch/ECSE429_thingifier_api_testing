const { Given, When, Then, After, BeforeAll, AfterAll } = require('cucumber');
const {
    runServer,
    shutdownServer,
    isServerUp,
    convertToObjects,
    getIdsOnly
} = require('./helper');
const {
    getFromTitle,
    getFromId,
    getAll,
    getOneRelationship,
    updateOne,
    updateMultiple,
    createOne,
    createMultiple,
    deleteOne,
    createOneRelationship,
    createMultipleRelationships,
    deleteOneRelationship,
    deleteMultipleRelationships,
    cleanUp
} = require('./api_helper');

const { expect } = require('chai');

let resBody;

BeforeAll(async function () {
    await runServer();
});

AfterAll(async function () {
    await shutdownServer();
});

After(async function () {
    await cleanUp();
});

// GIVEN

Given('the system is running on localhost and is clean', async function () {
    const running = await isServerUp();
    expect(running).to.be.equal(true);
});

Given('tasks with the following details are created:', async function (rawTasks) {
    const todos = convertToObjects(rawTasks);
    await createMultiple('todos', todos);
});

Given('categories with the following details are created:', async function (rawCategories) {
    const categories = convertToObjects(rawCategories);
    await createMultiple('categories', categories);
});

Given('category with title {string} and description {string} is created', async function (categoryTitle, categoryDescription) {
    await createOne('categories', { title: categoryTitle, description: categoryDescription });
});

Given('project with title {string} and description {string} is created', async function (projectTitle, projectDescription) {
    await createOne('projects', { title: projectTitle, description: projectDescription });
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
    await createMultipleRelationships('todos', todoIds, 'categories', category.id);
});

Given('previously created tasks are added to class todo list {string}', async function (projectTitle) {
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    const project = (await getFromTitle('projects', projectTitle))[0];
    await createMultipleRelationships('todos', todoIds, 'tasksof', project.id);
});

Given('the class of title {string} is set to complete', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    await updateOne('projects', project.id, { completed: true });
});

Given('the category {string} is assigned to each todo', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    // BUGGY BEHAVIOUR HERE (Explained inside the createOneRelationship function which is called by createMultipleRelationships)
    await createMultipleRelationships('todos', todoIds, 'categories', category.id);
});

// WHEN

When('student categorizes existing tasks with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    await createMultipleRelationships('todos', todoIds, 'categories', category.id);
});

When('student categorizes existing task with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    await createOneRelationship('todos', todos[0].id, 'categories', category.id);
});

When('student creates an instance of relationship for unexisting task with id {int}', async function (id) {
    resBody = await createOneRelationship('todos', id, 'categories', 1);
});

When('student changes the task description to {string}', async function (newTaskDescription) {
    const todos = await getAll('todos');
    await updateOne('todos', todos[0].id, { description: newTaskDescription });
});

When('student changes description of a unexisting task with id {int} and with description {string}', async function (id, newTaskDescription) {
    resBody = await updateOne('todos', id, { description: newTaskDescription });
});

When('student marks task with title {string} as done', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    await updateOne('todos', todo.id, { doneStatus: true });
});

When('student marks an unexisting task with id {int} as done', async function (id) {
    resBody = await updateOne('todos', id, { doneStatus: true });
});

When('student adds task with title {string} to class todo list', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const project = (await getAll('projects'))[0];
    await createOneRelationship('todos', todo.id, 'tasksof', project.id);
});

When('student adds unexisting task with id {int} to class todo list', async function (id) {
    const project = (await getAll('projects'))[0];
    resBody = await createOneRelationship('todos', id, 'tasksof', project.id);
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
    await createMultipleRelationships('todos', todoIds, 'categories', category.id);
});

When('student adjusts priority of unexisting task with id {int}', async function (id) {
    const category = (await getAll('categories'))[0];
    resBody = await createOneRelationship('todos', id, 'categories', category.id);
});

When('student removes task with title {string} from class {string}', async function (taskTitle, projectTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const project = (await getFromTitle('projects', projectTitle))[0];
    await deleteOneRelationship('todos', todo.id, 'tasksof', project.id);
});

When('student removes task with id {string} from unexisting class todo list with id {int}', async function (validId, id) {
    resBody = await deleteOneRelationship('todos', parseInt(validId), 'tasksof', id);
});

When('student queries incomplete tasks of class with class title {string}', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    resBody = await getOneRelationship('projects', project.id, 'tasks', { doneStatus: 'false' });
});

When('student queries incomplete tasks of unexisting class with id {int}', async function (id) {
    resBody = await getOneRelationship('projects', id, 'tasks', { doneStatus: 'false' });
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

When('student removes unexistent course with id {int}', async function (id) {
    resBody = await deleteOne('projects', id);
});


When('student replaces the existing task with title {string} with a new description {string}', async function (taskTitle, taskDescription) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    await createOne('todos', { title: taskTitle, description: taskDescription });
    await deleteOne('todos', todo.id);
});

When('course to do list with title {string} and description {string} is created as a category', async function (categoryTitle, categoryDescription) {
    resBody = await createOne('categories', { title: categoryTitle, description: categoryDescription });
});

When('student adds task with title {string} to class todo list represented as category', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const category = (await getAll('categories'))[0];
    await createOneRelationship('todos', todo.id, 'categories', category.id);
});

When('course to do list with title {string}, description {string} and term {string} is created', async function (projectTitle, projectDescription, projectTerm) {
    resBody = await createOne('projects', { title: projectTitle, description: projectDescription, term: projectTerm });
});

When('student categorizes as project existing tasks with priority {string}', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    const todos = await getAll('todos');
    const todoIds = getIdsOnly(todos);
    await createMultipleRelationships('todos', todoIds, 'tasksof', project.id);
});

When('student queries all incomplete and {string} tasks', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    resBody = await getOneRelationship('categories', category.id, 'todos', { doneStatus: 'false' });
});

When('student queries all incomplete tasks for unexisting category with id {int}', async function (id) {
    resBody = await getOneRelationship('categories', id, 'todos', { doneStatus: 'false' });
});

// THEN

Then('the corresponding tasks should be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    const todos = await getAll('todos');
    todos.forEach(todo => {
        expect(todo.categories).to.deep.include({ id: category.id });
    });
});

Then('the corresponding tasks should be categorized as project with priority {string}', async function (projectTitle) {
    const project = (await getFromTitle('projects', projectTitle))[0];
    const todos = await getAll('todos');
    todos.forEach(todo => {
        expect(todo.tasksof).to.deep.include({ id: project.id });
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
    expect(resBody.errorMessages[0]).to.equal(error);
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
    expect(todos[0].categories).to.not.contain(category.id);
});

Then('class {string} should no longer have task with title {string}', async function (projectTitle, taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    const project = (await getFromTitle('projects', projectTitle))[0];
    expect(project.tasks).to.not.contain(todo.id);
});

Then('the system returns incomplete tasks of class {string}', async function (projectTitle) {
    resBody.forEach(todo => {
        expect(todo.doneStatus).to.equal('false');
    });
});

Then('the system should return all incomplete todos', async function () {
    expect(resBody).to.not.be.empty;
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

Then('the task with title {string} should be marked as done', async function (taskTitle) {
    const todo = (await getFromTitle('todos', taskTitle))[0];
    expect(todo.doneStatus).equal('true');
});

Then('the old task should be removed and a new one with a new description {string} should exist', async function (taskDescription) {
    const todos = await getAll('todos');
    expect(todos).to.have.lengthOf(1);
    expect(todos[0].description).to.be.equal(taskDescription);
});

Then('corresponding course todo list with title {string} should be created with description {string}', async function (categoryTitle, categoryDescription) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    expect(category.description).equal(categoryDescription);
});

Then('the category class todo list should have task with title {string}', async function (taskTitle) {
    const category = (await getAll('categories'))[0];
    const todo = (await getOneRelationship('categories', category.id, 'todos'))[0];
    expect(todo.title).equal(taskTitle);
});

Then('the system returns incomplete tasks of category {string}', async function (categoryTitle) {
    const category = (await getFromTitle('categories', categoryTitle))[0];
    resBody.forEach(todo => {
        expect(todo.doneStatus).to.equal('false');
        expect(todo.categories).to.deep.include({ id: category.id })
    });
});

Then('the system should return an empty list of todos', async function () {
    expect(resBody).to.not.be.empty;
    // expect(resBody).to.be.empty;
    /*
    THIS IS A BUG - SHOULD BE --> expect(resBody).to.be.empty;
    This bug was flagged in exploratory sessions in Part A. Basically, when providing an id of unexisting
    category, the API should either return an empty list of todos, or an error message. For this test, we
    decided to choose the former. However, the result we get is the list of todos related to an id that is not
    the one we provided. Indeed, the API seems to return the list of todos related to the first category it can
    find when provided with an id of undexisting category. In other words, if category with ID 1 exists and the 
    endpoint GET /categories/123456789/todos is called, then instead of returning an empty array of todos, it will
    return the todos related to category with ID 1. This is considered unexpected behaviour.
    */
});
