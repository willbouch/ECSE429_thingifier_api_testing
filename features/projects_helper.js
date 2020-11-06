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
    deleteProject: deleteProject,
    updateProject: updateProject
};
