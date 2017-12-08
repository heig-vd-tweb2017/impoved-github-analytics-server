const express = require('express');
const cors = require('cors');

class Server {
  /**
   * The constructor.
   * @param {integer} port The port to listen to if no default one is specified in ENV.
   * @param {Agent} agent The agent to interrogate.
   */
  constructor(port, agent) {
    this.app = express();
    this.app.use(cors({
      credentials: true,
      origin: true,
    }));

    this.port = port;
    this.agent = agent;

    this.app.get('/api/opened-issues/:owner/:repo', (req, res) => {
      const { owner, repo } = req.params;

      res.setHeader('Content-Type', 'application/json');

      res.write('[');

      let prevChunk = null;

      function sendData(err, data) {
        if (err == null) {
          if (prevChunk) {
            res.write(`${JSON.stringify(prevChunk)},`);
          }

          const users = Array.from(data.users);
          const dates = Array.from(data.dates);

          prevChunk = { users, dates };
        }
      }

      function endOfData() {
        if (prevChunk) {
          res.write(JSON.stringify(prevChunk));
        }
        res.end(']');
      }

      this.agent.getOpenedIssues(owner, repo, sendData, endOfData);
    });

    this.app.get('/api/closed-issues/:owner/:repo', (req, res) => {
      const { owner, repo } = req.params;

      res.setHeader('Content-Type', 'application/json');

      res.write('[');

      let prevChunk = null;

      function sendData(err, data) {
        if (err == null) {
          if (prevChunk) {
            res.write(`${JSON.stringify(prevChunk)},`);
          }

          const users = Array.from(data.users);
          const dates = Array.from(data.dates);

          prevChunk = { users, dates };
        }
      }

      function endOfData() {
        if (prevChunk) {
          res.write(JSON.stringify(prevChunk));
        }
        res.end(']');
      }

      this.agent.getClosedIssues(owner, repo, sendData, endOfData);
    });

    this.app.get('*', (req, res) => {
      res.send('Error 404 - Page not found.', 404);
    });
  }

  /**
   * Start the server.
   */
  start() {
    this.app.listen(this.port, () => {});
  }
}

module.exports = Server;
