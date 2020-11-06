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

module.exports = {
    getFromTitle: getFromTitle,
    getFromId:getFromId,
    getAll: getAll
};
