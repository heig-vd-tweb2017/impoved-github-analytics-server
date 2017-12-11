const request = require('superagent');
const moment = require('moment');
const GithubGraphQLApi = require('node-github-graphql');

class Agent {
  /**
   * The constructor.
   * @param {JSON object with username and token} credentials The credentials to use.
   * to query GitHub.
   */
  constructor(apiUrl, apiToken) {
    this.githubApi = new GithubGraphQLApi({
      Promise,
      url: apiUrl,
      token: apiToken,
      debug: false
    });
  }

  /**
   * Get all the issues.
   * @param {string} owner The GitHub's owner of the repository.
   * @param {string} repo The repository.
   * @param {string} dataAge The age of the data.
   * @param {string} dataGrouping How to group the data.
   * @param {function} dataAreAvailable The function to call when data are available.
   * @param {function} endOfData The function to call when there are no more data.
   */
  getIssues(owner, repo, dataAge, dataGrouping, dataAreAvailable, endOfData) {

    // Create the arrays to contain the data based on the data grouping
    // TODO

    // Get the total number of issues
    this.githubApi.query(`
      query ($owner: String! $repo: String! $numberToFetch: Int!) {
        repository(owner: $owner name: $repo) {
          issues(first: $numberToFetch orderBy: {field: CREATED_AT direction: ASC}) {
            totalCount
          }
        }
      }
    `, {
      'owner': owner,
      'repo': repo,
      'numberToFetch': 1
    }).then((res) => {
      const numberOfIssues = res.data.repository.issues.totalCount;

      // Change the number to fetch at a time based on data age and number of issues.
      // This allows to reduce the number of data retrieved from GitHub.
      // TODO
      const numberToFetch = 5;

      // Fetch and retrieve the pages until done
      fetchAndProcessPage(this.githubApi, numberToFetch, null);
    }).catch((err) => {
        console.log(err);
    });

    /**
     * Function called until all the data are fetched.
     * @param {string} pageUrl The GitHub's API URL.
     * @param {JSON object with username and token} credentials  The credentials to use
     * to query GitHub.
     */
    function fetchAndProcessPage(githubApi, numberToFetch, cursorId) {

      let getAfter = '';

      if (cursorId != null) {
        getAfter = `before: "${cursorId}"`;
      }

      githubApi.query(`
        query ($owner: String!, $repo: String!, $numberToFetch: Int!) {
          repository(owner: $owner name: $repo) {
            issues(last: $numberToFetch ${getAfter} orderBy: {field: CREATED_AT direction: ASC}) {
              edges {
                node {
                  author {
                    login
                  }
                  state
                  createdAt
                  closedAt
                }
              }
              pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `, {
        'owner': owner,
        'repo': repo,
        'numberToFetch': numberToFetch
      }).then((res) => {
        // Get data from the respond
        const pageInfo = res.data.repository.issues.pageInfo;
        const issues = res.data.repository.issues.edges;

        // Process issues
        console.log(JSON.stringify(issues, null, 2));

        // If there are more pages, retrieve and process them
        if (pageInfo.hasPreviousPage) {
          fetchAndProcessPage(githubApi, numberToFetch, pageInfo.startCursor);
        } else {
          endOfData();
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}

module.exports = Agent;
