const request = require('superagent');
const moment = require('moment');

class Agent {
  /**
   * The constructor.
   * @param {JSON object with username and token} credentials The credentials to use.
   * to query GitHub.
   */
  constructor(credentials) {
    this.credentials = credentials;
  }

  /**
   * Get all the opened issues.
   * @param {string} owner The GitHub's owner of the repository
   * @param {string} repo The repository.
   * @param {function} dataAreAvailable The function to call when data are available.
   * @param {function} endOfData The function to call when there are no more data.
   */
  getOpenedIssues(owner, repo, dataAreAvailable, endOfData) {
    const targetUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=all`;

    const dates = new Map();
    const users = new Map();

    /**
     * Function called until all the data are fetched.
     * @param {string} pageUrl The GitHub's API URL.
     * @param {JSON object with username and token} credentials  The credentials to use
     * to query GitHub.
     */
    function fetchAndProcessPage(pageUrl, credentials) {
      request
        .get(pageUrl)
        .auth(credentials.username, credentials.token)
        .end((err, res) => {
          if (err == null) {
            res.body.forEach((record) => {
              const openedDate = moment(record.created_at).format('YYYY-MM-DD');

              // Store the number of opened issues at the given date
              if (!dates.has(openedDate)) {
                dates.set(openedDate, 1);
              } else {
                dates.set(openedDate, dates.get(openedDate) + 1);
              }

              // Save the user who opened the issue
              const user = record.user.login;

              if (!users.has(user)) {
                users.set(user, 1);
              } else {
                users.set(user, users.get(user) + 1);
              }
            });

            dataAreAvailable(null, { users, dates });

            if (res.links.next) {
              fetchAndProcessPage(res.links.next, credentials);
            } else {
              endOfData();
            }
          } else {
            endOfData();
          }
        });
    }

    fetchAndProcessPage(targetUrl, this.credentials);
  }

  /**
   * Get all the closed issues.
   * @param {string} owner The GitHub's owner of the repository
   * @param {string} repo The repository.
   * @param {function} dataAreAvailable The function to call when data are available.
   * @param {function} endOfData The function to call when there are no more data.
   */
  getClosedIssues(owner, repo, dataAreAvailable, endOfData) {
    const targetUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=all`;

    const dates = new Map();
    const users = new Map();

    /**
     * Function called until all the data are fetched.
     * @param {string} pageUrl The GitHub's API URL.
     * @param {JSON object with username and token} credentials  The credentials to use
     * to query GitHub.
     */
    function fetchAndProcessPage(pageUrl, credentials) {
      request
        .get(pageUrl)
        .auth(credentials.username, credentials.token)
        .end((err, res) => {
          if (err == null) {
            res.body.forEach((record) => {
              const openedDate = moment(record.created_at).format('YYYY-MM-DD');

              // Set zero closed issue at the given opened date
              if (!dates.has(openedDate)) {
                dates.set(openedDate, 0);
              }

              // If there is a closed date, we add to the
              // closed issue at the given closed date
              if (record.closed_at !== null) {
                const closedDate = moment(record.closed_at).format('YYYY-MM-DD');

                // Store the number of closed issues at the given date
                if (!dates.has(closedDate)) {
                  dates.set(closedDate, 1);
                } else {
                  dates.set(closedDate, dates.get(closedDate) + 1);
                }

                // Save the user who closed the issue
                const user = record.user.login;

                if (!users.has(user)) {
                  users.set(user, 1);
                } else {
                  users.set(user, users.get(user) + 1);
                }
              }
            });

            dataAreAvailable(null, { users, dates });

            if (res.links.next) {
              fetchAndProcessPage(res.links.next, credentials);
            } else {
              endOfData();
            }
          } else {
            endOfData();
          }
        });
    }

    fetchAndProcessPage(targetUrl, this.credentials);
  }
}

module.exports = Agent;
