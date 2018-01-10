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
      const authors = [];
      let totalOpenedIssues = 0;
      let totalClosedIssues = 0;

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
                      url
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

          let datesAlwaysInRange = true;

          /**
           * Function called to filter issues.
           * @param {Object} issue The issue's data.
           * @returns {boolean} True the issue has to be kept, false otherwise.
           */
          function isIssueValid(issueData) {
            const issue = issueData.node;

            const { author, createdAt } = issue;

            // An author can be null if it was deleted by the past
            if (author == null) {
              return false;
            } else if (moment(createdAt).isBefore(oldestIssuesToFetch)) {
              datesAlwaysInRange = false;
              return false;
            }

            // The issue is kept
            return true;
          }

          const validIssues = issuesData.filter(isIssueValid);

          // Process issues
          validIssues.forEach((issueData) => {
            const issue = issueData.node;

            const author = issue.author.login;
            const profilUrl = issue.author.url;
            const closedDate = issue.closedAt;

            // Add the author if it doesn't exist
            if (authors.find(element => element.author === author) == null) {
              authors.push({
                author,
                profilUrl,
                openedIssues: 0,
                closedIssues: 0,
              });
            }

            totalOpenedIssues += 1;
            authors.find(element => element.author === author).openedIssues += 1;

            // Only consider the closed issue if the date is valid
            if (moment(closedDate).isValid()) {
              totalClosedIssues += 1;
              authors.find(element => element.author === author).closedIssues += 1;
            }
          });

          // Prepare the best authors based on their opening and closing number of issues
          let bestOIAuthors = authors;
          let bestCIAuthors = authors;

          // Sort the data
          bestOIAuthors.sort((author1, author2) => author2.openedIssues - author1.openedIssues);
          bestCIAuthors.sort((author1, author2) => author2.closedIssues - author1.closedIssues);

          // Keep only a certain % of the best authors to avoid bashing
          const numberOfAuthorsToKeep = Math.ceil(authors.length * 0.15);

          bestOIAuthors = bestOIAuthors.slice(0, numberOfAuthorsToKeep);
          bestCIAuthors = bestCIAuthors.slice(0, numberOfAuthorsToKeep);

          // Create data payload
          const data = {
            age: `${dataAgeValue} ${dataAgeUnit}`,
            start: moment().format('YYYY-MM-DD'),
            end: oldestIssuesToFetch.format('YYYY-MM-DD'),
            endOfStream: false,
            numberOfAuthors: authors.length,
            bestOpenedIssuesAuthors: bestOIAuthors,
            bestClosedIssuesAuthors: bestCIAuthors,
            totalOpenedIssues,
            totalClosedIssues,
          };

          // If there are more pages, retrieve and process them
          if (datesAlwaysInRange && pageInfo.hasPreviousPage) {
            // Send the data to the client
            socket.emit(socketMessage, { data });

            fetchAndProcessPage(githubApi, numberOfElementsToFetch, pageInfo.startCursor);
          } else {
            // Last data to send to the client
            data.endOfStream = true;
            socket.emit(socketMessage, { data });

            // Return the data to the promise
            resolve(data);
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
      const issues = [];
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
        issues.push({
          date: date.format(format),
          openedIssues: 0,
          closedIssues: 0,
        });
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

          let datesAlwaysInRange = true;

          /**
           * Function called to filter issues.
           * @param {Object} issueData The issue's data.
           * @returns {boolean} True the issue has to be kept, false otherwise.
           */
          function isIssueValid(issueData) {
            const issue = issueData.node;

            const { createdAt } = issue;

            if (moment(createdAt).isBefore(oldestIssuesToFetch)) {
              datesAlwaysInRange = false;
              return false;
            }

            // The issue is kept
            return true;
          }

          const validIssues = issuesData.filter(isIssueValid);

          // Process issues
          validIssues.forEach((issueData) => {
            const issue = issueData.node;

            const createdDate = moment(issue.createdAt);
            const closedDate = moment(issue.closedAt);

            const createdDateFormatted = createdDate.format(format);
            issues.find(element => element.date === createdDateFormatted).openedIssues += 1;

            // Only consider the closed issue if the date is valid
            if (closedDate.isValid()) {
              const closedDateFormatted = closedDate.format(format);
              issues.find(element => element.date === closedDateFormatted).closedIssues += 1;
            }
          });

          // Data are available
          const data = {
            age: `${dataAgeValue} ${dataAgeUnit}`,
            start: moment().format('YYYY-MM-DD'),
            end: oldestIssuesToFetch.format('YYYY-MM-DD'),
            endOfStream: false,
            grouping: dataAgeGrouping,
            format,
            issues,
          };

          // If there are more pages, retrieve and process them
          if (datesAlwaysInRange && pageInfo.hasPreviousPage) {
            // Send the data to the client
            socket.emit(socketMessage, { data });

            fetchAndProcessPage(githubApi, numberOfElementsToFetch, pageInfo.startCursor);
          } else {
            // Last data to send to the client
            data.endOfStream = true;
            socket.emit(socketMessage, { data });

            // Return the data to the promise
            resolve(data);
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
