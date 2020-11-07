const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const createProject = async project => {
    const res = await chai.request(host).post('/projects').send(project);
    return res.body.id;
};

const createProjects = async projects => {
    const ids = [];
    for (const project of projects) {
        const id = await createProject(project);
        ids.push(id);
    }
    return ids;
};

const getProjects = async () => {
    const res = await chai.request(host).get(`/projects`);
    return res.body.projects;
};

const getProjectsFromTitle = async title => {
    formattedTitle = title.replace(' ', '+')
    const res = await chai.request(host).get(`/projects?title=${title}`);
    return res.body.projects;
};

const setProjectToComplete = async projectId => {
    const body = {
        completed: true
    };
    const res = await chai.request(host).post(`/projects/${projectId}`).send(body);

const deleteProject = async (projectId) => {
    const res = await chai.request(host).delete(`/projects/${projectId}`);
    return res.body;
};

const updateProject = async (projectId, updates) => {
    const res = await chai.request(host).post(`/projects/${projectId}`).send(updates);
    return res.body;
};

module.exports = {
    createProject: createProject,
    createProjects: createProjects,
    getProjects: getProjects,
    getProjectsFromTitle: getProjectsFromTitle,
    setProjectToComplete: setProjectToComplete,
    deleteProject: deleteProject,
    updateProject: updateProject
};
