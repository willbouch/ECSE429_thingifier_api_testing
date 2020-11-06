const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const host = 'http://localhost:4567';

const createCategory = async category => {
    const res = await chai.request(host).post('/categories').send(category);
    return res.body.id;
};

const createCategories = async categories => {
    const ids = [];
    for (const category of categories) {
        const id = await createCategory(category);
        ids.push(id);
    }
    return ids;
};


module.exports = {
    createCategory: createCategory,
    createCategories: createCategories,
};
