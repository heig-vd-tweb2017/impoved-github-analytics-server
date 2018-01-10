const should = require('./chai-config.js');

const {
  port, token, mongodbUri,
} = require('./local-development.json');

const Agent = require('../src/agent.js');
const Database = require('../src/database.js');
const Server = require('../src/server.js');

describe('Server', () => {
  const agent = new Agent('https://api.github.com/graphql', token);
  const database = new Database(mongodbUri);
  const server = new Server(port, agent, database);

  server.start();

  it('should not return any errors', (done) => {
    should.exist(agent);
    should.exist(database);
    should.exist(server);
    done();
  });
});
