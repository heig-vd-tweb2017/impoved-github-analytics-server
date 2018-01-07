const cors = require('cors');
const app = require('express')().use(cors());
const http = require('http').Server(app);
const io = require('socket.io')(http);
const moment = require('moment');

class Server {
  /**
   * The constructor.
   * @param {integer} port The port to listen to if no default one is specified in ENV.
   * @param {Agent} agent The agent to interrogate.
   * @param {Database} database The database where to save the data.
   */
  constructor(port, agent, database) {
    this.port = port;

    app.get('/', (req, res) => {
      res.sendFile(`${__dirname}/index.html`);
    });

    io.on('connection', (socket) => {
      socket.on('number-of-issues-by-grouping', (filters) => {
        const {
          owner,
          repo,
          dataAgeValue,
          dataAgeUnit,
          dataAgeGrouping,
        } = filters;

        agent.getNumberOfIssuesByGrouping(
          owner,
          repo,
          dataAgeValue,
          dataAgeUnit,
          dataAgeGrouping,
          socket,
          'number-of-issues-by-grouping-results',
        )
          .catch((err) => {
            socket.emit('number-of-issues-by-grouping-results', { error: err });
          });
      });

      socket.on('number-of-issues-by-authors', (filters) => {
        const {
          owner,
          repo,
          dataAgeValue,
          dataAgeUnit,
        } = filters;

        agent.getNumberOfIssuesByAuthors(
          owner,
          repo,
          dataAgeValue,
          dataAgeUnit,
          socket,
          'number-of-issues-by-authors-results',
        )
          .then((numberOfIssuesByAuthors) => {
            // Send old data
            database.getAuthorsResults(owner, repo)
              .then((data) => {
                socket.emit('number-of-issues-by-authors-old-results', { data });

                return new Promise((resolve) => {
                  // Prepare new data
                  const now = moment();

                  const {
                    start,
                    end,
                    age,
                    bestOpenedIssuesAuthors,
                    bestClosedIssuesAuthors,
                  } = numberOfIssuesByAuthors;

                  const newData = {
                    owner,
                    repo,
                    date: now,
                    start,
                    end,
                    age,
                    bestOpenedIssuesAuthors: bestOpenedIssuesAuthors.slice(0, 3),
                    bestClosedIssuesAuthors: bestClosedIssuesAuthors.slice(0, 3),
                  };

                  resolve(newData);
                });
              })
              .then((data) => {
                // Save the data
                database.saveAuthorsResults(data);
              })
              .catch((err) => {
                socket.emit('number-of-issues-by-authors-old-results', { error: err });
              });
          }).catch((err) => {
            socket.emit('number-of-issues-by-authors-results', { error: err });
          });
      });
    });
  }

  /**
   * Start the server.
   */
  start() {
    http.listen(this.port, () => {
      console.log(`Listening on *:${this.port}`);
    });
  }
}

module.exports = Server;
