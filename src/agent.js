const GithubGraphQLApi = require('node-github-graphql');
const moment = require('moment');

class Agent {
  /**
   * The constructor.
   * @param {string} apiUrl The API's URL to query.
   * @param {string} apiToken The API's token to use the service.
   */
  constructor(apiUrl, apiToken) {
    this.githubApi = new GithubGraphQLApi({
      url: apiUrl,
      token: apiToken,
      debug: false,
    });
  }

  /**
   * Get all the data regarding the issues for a given period.
   * @param {string} owner The GitHub's owner of the repository.
   * @param {string} repo The repository.
   * @param {string} dataAgeValue The value of the age of the data.
   * @param {string} dataAgeUnit The unit of the value of the age of the data.
   * @param {Socket} socket Socket where to send the data.
   * @param {string} socketMessage The socket's message.
   */
  getNumberOfIssuesByAuthors(owner, repo, dataAgeValue, dataAgeUnit, socket, socketMessage) {
    return new Promise((resolve, reject) => {
      const authors = {};

      const oldestIssuesToFetch = moment().subtract(dataAgeValue, dataAgeUnit);

      /**
       * Function called until all the data are fetched.
       * @param {string} githubApi The GitHub's API.
       * @param {int} numberOfElementsToFetch The number of elements to fetch at a time.
       * @param {string} cursorId The starting cursor from where to search.
       */
      function fetchAndProcessPage(githubApi, numberOfElementsToFetch, cursorId) {
        let additionalParameters = '';

        if (cursorId != null) {
          additionalParameters = `before: "${cursorId}"`;
        }

        githubApi.query(`
          query ($owner: String!, $repo: String!, $numberToFetch: Int!) {
            repository(owner: $owner name: $repo) {
              issues(last: $numberToFetch ${additionalParameters} orderBy: {field: CREATED_AT direction: ASC}) {
                edges {
                  node {
                    author {
                      login
                    }
                    createdAt
                    closedAt
                  }
                }
                pageInfo {
                  startCursor
                  hasPreviousPage
                }
              }
            }
          }
        `, {
          owner,
          repo,
          numberToFetch: numberOfElementsToFetch,
        }).then((res) => {
          // Get data from the response
          const { pageInfo } = res.data.repository.issues;
          const issuesData = res.data.repository.issues.edges;

          // Check if the dates are always in the range
          let datesAlwaysInRange = true;

          // Process issues
          issuesData.forEach((issueData) => {
            const issue = issueData.node;

            const author = issue.author.login;
            const createdDate = moment(issue.createdAt);
            const closedDate = moment(issue.closedAt);

            // If the date is in the range, store it
            if (createdDate.isSameOrAfter(oldestIssuesToFetch)) {
              // Add the author if it doesn't exist
              if (authors[author] == null) {
                authors[author] = {
                  openedIssues: 0,
                  closedIssues: 0,
                };
              }

              authors[author].openedIssues += 1;

              // Only consider the closed issue if the date is valid
              if (closedDate.isValid()) {
                authors[author].closedIssues += 1;
              }
            } else {
              datesAlwaysInRange = false;
            }
          });

          // Data are available
          const data = {
            age: `${dataAgeValue} ${dataAgeUnit}`,
            start: moment().format('YYYY-MM-DD'),
            end: oldestIssuesToFetch.format('YYYY-MM-DD'),
            authors,
          };

          socket.emit(socketMessage, { data });

          // If there are more pages, retrieve and process them
          if (datesAlwaysInRange && pageInfo.hasPreviousPage) {
            fetchAndProcessPage(githubApi, numberOfElementsToFetch, pageInfo.startCursor);
          } else {
            resolve();
          }
        }).catch((err) => {
          reject(err);
        });
      }

      // Fetch and retrieve the pages until done
      fetchAndProcessPage(this.githubApi, 50, null);
    });
  }

  /**
   * Get all the data regarding the issues for a given period.
   * @param {string} owner The GitHub's owner of the repository.
   * @param {string} repo The repository.
   * @param {string} dataAgeValue The value of the age of the data.
   * @param {string} dataAgeUnit The unit of the value of the age of the data.
   * @param {string} dataAgeGrouping How to group the data.
   * @param {Socket} socket Socket where to send the data.
   * @param {string} socketMessage The socket's message.
   */
  getNumberOfIssuesByGrouping(
    owner,
    repo,
    dataAgeValue,
    dataAgeUnit,
    dataAgeGrouping,
    socket,
    socketMessage,
  ) {
    return new Promise((resolve, reject) => {
      const issues = {};
      let format = '';
      let subtract = '';

      const oldestIssuesToFetch = moment().subtract(dataAgeValue, dataAgeUnit);

      if (dataAgeGrouping === 'days') {
        format = 'YYYY-MM-DD';
        subtract = 'day';
      } else if (dataAgeGrouping === 'weeks') {
        format = 'YYYY-ww';
        subtract = 'week';
      } else if (dataAgeGrouping === 'months') {
        format = 'YYYY-MM';
        subtract = 'month';
      } else if (dataAgeGrouping === 'years') {
        format = 'YYYY';
        subtract = 'year';
      } else {
        reject();
      }

      // Generate the issues array based on the age of data and grouping
      for (
        let date = moment();
        date.isSameOrAfter(oldestIssuesToFetch);
        date.subtract(1, subtract)
      ) {
        issues[date.format(format)] = {
          openedIssues: 0,
          closedIssues: 0,
        };
      }

      /**
       * Function called until all the data are fetched.
       * @param {string} githubApi The GitHub's API.
       * @param {int} numberOfElementsToFetch The number of elements to fetch at a time.
       * @param {string} cursorId The starting cursor from where to search.
       */
      function fetchAndProcessPage(githubApi, numberOfElementsToFetch, cursorId) {
        let additionalParameters = '';

        if (cursorId != null) {
          additionalParameters = `before: "${cursorId}"`;
        }

        githubApi.query(`
              query ($owner: String!, $repo: String!, $numberToFetch: Int!) {
                repository(owner: $owner name: $repo) {
                  issues(last: $numberToFetch ${additionalParameters} orderBy: {field: CREATED_AT direction: ASC}) {
                    edges {
                      node {
                        createdAt
                        closedAt
                      }
                    }
                    pageInfo {
                      startCursor
                      hasPreviousPage
                    }
                  }
                }
              }
            `, {
          owner,
          repo,
          numberToFetch: numberOfElementsToFetch,
        }).then((res) => {
          // Get data from the response
          const { pageInfo } = res.data.repository.issues;
          const issuesData = res.data.repository.issues.edges;

          // Check if the dates are always in the range
          let datesAlwaysInRange = true;

          // Process issues
          issuesData.forEach((issueData) => {
            const issue = issueData.node;

            const createdDate = moment(issue.createdAt);
            const closedDate = moment(issue.closedAt);

            // If the date is in the range, store it
            if (createdDate.isSameOrAfter(oldestIssuesToFetch)) {
              issues[createdDate.format(format)].openedIssues += 1;

              // Only consider the closed issue if the date is valid
              if (closedDate.isValid()) {
                issues[closedDate.format(format)].closedIssues += 1;
              }
            } else {
              datesAlwaysInRange = false;
            }
          });

          // Data are available
          const data = {
            age: `${dataAgeValue} ${dataAgeUnit}`,
            start: moment().format('YYYY-MM-DD'),
            end: oldestIssuesToFetch.format('YYYY-MM-DD'),
            grouping: dataAgeGrouping,
            format,
            issues,
          };

          socket.emit(socketMessage, { data });

          // If there are more pages, retrieve and process them
          if (datesAlwaysInRange && pageInfo.hasPreviousPage) {
            fetchAndProcessPage(githubApi, numberOfElementsToFetch, pageInfo.startCursor);
          } else {
            resolve();
          }
        }).catch((err) => {
          reject(err);
        });
      }

      // Fetch and retrieve the pages until done
      fetchAndProcessPage(this.githubApi, 50, null);
    });
  }
}

module.exports = Agent;
