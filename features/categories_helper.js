const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const createCategory = async category => {
    const res = await chai.request(host).post('/categories').send(category);
    return res.body.id;
};

module.exports = {
    createCategory: createCategory
};
