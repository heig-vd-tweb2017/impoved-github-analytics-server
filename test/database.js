const should = require('./chai-config.js');
const moment = require('moment');

const { mongodbUri, owner, repo } = require('./local-development.json');

const Database = require('../src/database.js');

describe('Database', () => {
  const database = new Database(mongodbUri);

  const now = moment();

  const newData = {
    owner,
    repo,
    date: now,
    start: now.subtract(3, 'days'),
    end: now.subtract(1, 'days'),
    age: '3 days',
    bestOpenedIssuesAuthors: [],
    bestClosedIssuesAuthors: [],
  };

  it('should be able to save data', (done) => {
    database.saveAuthorsResults(newData)
      .then((data) => {
        should.exist(data);
        database.close();
        done();
      })
      .catch((err) => {
        should.not.exist(err);
        database.close();
      });
  });
});
