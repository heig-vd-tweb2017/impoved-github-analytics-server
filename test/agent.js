const should = require('./chai-config.js');
const credentials = require('../src/github-credentials.json');

const Agent = require('../src/agent.js');

describe('Agent', () => {
  it('should fetch opened issues', (done) => {
    const owner = '2find';
    const repo = 'stereo';
    const agent = new Agent(credentials);

    function sendData(err, issues) {
      should.not.equal(issues, null);
      issues.should.have.property('users');
      issues.should.have.property('dates');
    }

    function endOfData() {
      done();
    }

    agent.getOpenedIssues(owner, repo, sendData, endOfData);
  });

  it('should fetch closed issues', (done) => {
    const owner = '2find';
    const repo = 'stereo';
    const agent = new Agent(credentials);

    function sendData(err, issues) {
      should.not.equal(issues, null);
      issues.should.have.property('users');
      issues.should.have.property('dates');
    }

    function endOfData() {
      done();
    }

    agent.getClosedIssues(owner, repo, sendData, endOfData);
  });
});
