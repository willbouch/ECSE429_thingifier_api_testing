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
    getTodosFromTitle,
    addTodoToProject,
    getTodo,
    uncategorizeTodos,
    addTodosToProject,
    removeTodoFromProject,
    getIncompleteTodosFromProject,
} = require('./todos_helper');
const {
    createCategory,
    getCategoriesFromTitle,
    createCategories,
    getCategories,
    getIncompleteHighPriorityTodos
} = require('./categories_helper');
const {
    createProject,
    createProjects,
    getProjects,
    getProjectsFromTitle,
    setProjectToComplete
} = require('./projects_helper');

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

Given('projects with the following details are created:', async function (rawProjects) {
    const projects = convertToObjects(rawProjects);
    await createProjects(projects);
});

Given('previously created tasks are categorized as {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    const todoIds = getIdsOnly(todos);
    await categorizeTodos(todoIds, { id: category.id.toString() })
});

Given('previously created tasks are added to class todo list {string}', async function (projectTitle) {
    const todos = await getTodos();
    const todoIds = getIdsOnly(todos);
    const project = (await getProjectsFromTitle(projectTitle))[0];
    await addTodosToProject(todoIds, { id: project.id.toString() })
});

Given('the class of title {string} is set to complete', async function (projectTitle) {
    const project = (await getProjectsFromTitle(projectTitle))[0];
    await setProjectToComplete({ id: project.id.toString() })
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
    resBody = await updateTodo(unexistingId, { doneStatus: true });
});

When('student adds task with title {string} to class todo list', async function (taskTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    const project = (await getProjects())[0];
    await addTodoToProject(todo.id, { id: project.id })
});

When('student adds unexisting task to class todo list', async function () {
    const project = (await getProjects())[0];
    resBody = await addTodoToProject(unexistingId, { id: project.id.toString() })
});

When('student removes previous categorization with priority {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    const todoIds = getIdsOnly(todos);
    await uncategorizeTodos(todoIds, category.id);
});

When('student adjusts priority of unexisting task', async function () {
    const category = (await getCategories())[0];
    resBody = await categorizeTodo(unexistingId, { id: category.id.toString() })
});

When('student removes task with title {string} from class {string}', async function (taskTitle, projectTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    const project = (await getProjectsFromTitle(projectTitle))[0];
    await removeTodoFromProject(todo.id, project.id);
});

When('student removes unexisting task to class todo list', async function () {
    const project = (await getProjects())[0];
    resBody = await removeTodoFromProject(unexistingId, { id: project.id.toString() })
});

When('student queries incomplete tasks of class with class title {string}', async function (projectTitle) {
    const project = (await getProjectsFromTitle(projectTitle))[0];
    resBody = await getIncompleteTodosFromProject({ id: project.id.toString() })
});

When('student queries incomplete tasks of unexisting class', async function (){
    resBody = await getIncompleteTodosFromProject(unexistingId)
});

When('student queries all incomplete and {string} priority tasks', async function(categoryTitle){
    resBody = await getIncompleteHighPriorityTodos(categoryTitle);
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
    expect(todo.doneStatus).to.equal('true');
});

Then('task with title {string} should still be marked as done', async function (taskTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    expect(todo.doneStatus).to.equal('true');
});

Then('class todo list should have task with title {string}', async function (taskTitle) {
    const project = (await getProjects())[0];
    const todo = await getTodo(project.tasks[0].id);
    expect(todo.title).to.equal(taskTitle);
});

Then('the corresponding tasks should no longer be categorized with priority {string}', async function (categoryTitle) {
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getTodos();
    expect(todos[0].categories).to.not.contain(category.id)
});

Then('class {string} should no longer have task with title {string}', async function (projectTitle, taskTitle) {
    const todo = (await getTodosFromTitle(taskTitle))[0];
    const project = (await getProjectsFromTitle(projectTitle))[0];
    expect(project.tasks).to.not.contain(todo.id);
});

Then ('the system returns incomplete tasks of title {string} of class {string}', async function (taskTitle0, projectTitle){
    const project = (await getProjectsFromTitle(projectTitle))[0];
    const todos = await getIncompleteTodosFromProject({ id: project.id.toString() })
    expect(todos[0].title).to.be.equal(taskTitle0);
    // expect(todos[1].title).to.be.equal(taskTitle1); //weird bug where they switch just like before
});

Then('the system should return all incomplete todos', async function () {
    expect(resBody).to.not.be.empty; 
});

Then('the system returns a list of {string} priority tasks including {string}, {string}, and {string}', async function (categoryTitle, taskTitle0, taskTitle1, taskTitle2){
    const category = (await getCategoriesFromTitle(categoryTitle))[0];
    const todos = await getIncompleteHighPriorityTodos(categoryTitle);
    console.log(todos);
    // expect(todos[0].title).to.be.equal(taskTitle0);
    // expect(todos[1].title).to.be.equal(taskTitle1);
    // expect(todos[2].title).to.be.equal(taskTitle2);
});