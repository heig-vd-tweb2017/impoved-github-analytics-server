const request = require('superagent');

const should = require('./chai-config.js');
const credentials = require('../src/github-credentials.json');

const Agent = require('../src/agent.js');
const Server = require('../src/server.js');

describe('Server', () => {
  const port = 9090;

  const owner = '2find';
  const repo = 'stereo';

  const url = `http://localhost:${port}`;

  const agent = new Agent(credentials);
  const server = new Server(port, agent);

  server.start();

  it('should get opened issues', (done) => {
    request.get(`${url}/api/closed-issues/${owner}/${repo}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        should.not.equal(res, null);

        res.body[0].should.have.property('users');
        res.body[0].should.have.property('dates');

        should.equal(err, null);
        done();
      });
  });

  it('should get closed issues', (done) => {
    request.get(`${url}/api/closed-issues/${owner}/${repo}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        should.not.equal(res, null);

        res.body[0].should.have.property('users');
        res.body[0].should.have.property('dates');

        should.equal(err, null);
        done();
      });
  });

  it('should return error on inexisting URL', (done) => {
    request.get(`${url}/api/${owner}/${repo}`)
      .set('Accept', 'application/json')
      .end((err) => {
        err.should.have.property('status');
        err.status.should.equal(404);
        done();
      });
  });
});
