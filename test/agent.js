/*
eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "emit"
  ]
}]
*/

const should = require('./chai-config.js');
const { token, owner, repo } = require('./local-development.json');

const Agent = require('../src/agent.js');

class SocketMock {
  emit(socketMessage, object) {
    should.exist(socketMessage);
    should.exist(object);
  }
}

describe('Agent', () => {
  const agent = new Agent('https://api.github.com/graphql', token);

  const dataAgeValue = 3;
  const dataAgeUnit = 'months';
  const socket = new SocketMock();
  const socketMessage = 'AgentTest';

  it('should retrieve data until the end of the stream', (done) => {
    agent.getNumberOfIssuesByAuthors(owner, repo, dataAgeValue, dataAgeUnit, socket, socketMessage)
      .then((data) => {
        should.exist(data);
        done();
      })
      .catch((err) => {
        should.not.exist(err);
      });
  });
});
