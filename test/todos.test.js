var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Test for todos endpoints', function() {
    const host = 'http://localhost:4567';
    it('should get all todos', async function() {
        const res = await chai.request(host).get('/todos');
        chai.expect(res.body.todos).to.have.length(2);
    });
});