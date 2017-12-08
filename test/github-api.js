const should = require('./chai-config.js');
const request = require('superagent');
const { username, token } = require('../src/github-credentials.json');

describe('The GitHub API', () => {
  it('should be authentificated', (done) => {
    const owner = 'spring-projects';
    const repo = 'spring-kafka';
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
    request.get(url).auth(username, token).set('Accept', 'application/vnd.github.v3+json').end((err, res) => {
      should.not.equal(res, null);
      should.equal(err, null);
      done();
    });
  });
  it('allows me to get a list of pull requests', (done) => {
    const owner = 'spring-projects';
    const repo = 'spring-kafka';
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
    request.get(url).auth(username, token).set('Accept', 'application/vnd.github.v3+json').end((err, res) => {
      res.should.not.be.undefined();
      done();
    });
  });
});
