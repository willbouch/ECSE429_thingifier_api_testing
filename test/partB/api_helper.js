const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const createOne = async (option) => {
    const randomString = Math.random().toString(36).substring(7);
    const obj = { title: randomString, description: randomString };
    const res = await chai.request(host).post(`/${option}`).send(obj);
    return { api: res.body, internal: obj };
};

const updateOne = async (option) => {
    const randomString = Math.random().toString(36).substring(7);
    const obj = { title: randomString, description: randomString };
    const id = option === 'projects' ? 2 : 3;
    const res = await chai.request(host).post(`/${option}/${id}`).send(obj);
    return { api: res.body, internal: obj };
};

const deleteOne = async (option) => {
    const id = option === 'projects' ? 2 : 3;
    const res = await chai.request(host).delete(`/${option}/${id}`);
    return res.body;
};

const createMultiple = async (option, num) => {
    for (var i = 0; i < num; i++) {
        const randomString = Math.random().toString(36).substring(7);
        await chai.request(host).post(`/${option}`).send({ title: randomString, description: randomString });
    }
};

module.exports = {
    createOne: createOne,
    updateOne: updateOne,
    deleteOne: deleteOne,
    createMultiple: createMultiple,
};
