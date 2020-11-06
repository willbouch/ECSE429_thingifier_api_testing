const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const getFromTitle = async (option, title) => {
    formattedTitle = title.replace(' ', '+')
    const res = await chai.request(host).get(`/${option}?title=${title}`);
    return res.body[option];
};

const getFromId = async (option, id) => {
    const res = await chai.request(host).get(`/${option}/${id}`);
    return res.body[option][0];
};

const getAll = async option => {
    const res = await chai.request(host).get(`/${option}`);
    return res.body[option];
};

const createOne = async (option, object) => {
    await chai.request(host).post(`/${option}`).send(object);
};

const createMultiple = async (option, objects) => {
    for (const object of objects) {
        await createOne(option, object);
    }
};

const updateOne = async (option, id, updates) => {
    const res = await chai.request(host).post(`/${option}/${id}`).send(updates);
    return res.body;
};

const updateMultiple = async (option, ids, updates) => {
    for (const id of ids) {
        await updateOne(option, id, updates);
    }
};

const deleteOne = async (option, id) => {
    const res = await chai.request(host).delete(`/${option}/${id}`);
    return res.body;
};


module.exports = {
    getFromTitle: getFromTitle,
    getFromId:getFromId,
    getAll: getAll,
    createOne: createOne,
    createMultiple: createMultiple,
    updateOne: updateOne,
    updateMultiple: updateMultiple,
    deleteOne: deleteOne
};
