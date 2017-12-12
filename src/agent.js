const request = require('superagent');
const moment = require('moment');
const GithubGraphQLApi = require('node-github-graphql');

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
      debug: false
    });
  }

  /**
   * Get all the data regarding the issues for a given period.
   * @param {string} owner The GitHub's owner of the repository.
   * @param {string} repo The repository.
   * @param {string} dataAgeValue The value of the age of the data.
   * @param {string} dataAgeUnit The unit of the value of the age of the data.
   * @param {string} dataAgeGrouping How to group the data.
   * @param {function} dataAreAvailable The function to call when data are available.
   * @param {function} endOfData The function to call when there are no more data.
   */
  getIssuesData(owner, repo, dataAgeValue, dataAgeUnit, dataAgeGrouping, dataAreAvailable, endOfData) {

    let issues = {};
    let authors = {};
    let format = '';
    let subtract = '';

    let oldestIssuesToFetch = moment().subtract(dataAgeValue, dataAgeUnit);
    
    if (dataAgeGrouping == "days") {
      format = 'YYYY-MM-DD';
      subtract = 'day';
    } else if (dataAgeGrouping == "weeks") {
      format = 'YYYY-ww'
      subtract = 'week';
    } else if (dataAgeGrouping == "months") {
      format = 'YYYY-MM'
      subtract = 'month';
    } else if (dataAgeGrouping == "years") {
      format = 'YYYY';
      subtract = 'year';
    } else {
      // TODO: Return an error
    }

    // Generate the issues array based on the age of data and grouping
    for (let date = moment(); date.isSameOrAfter(oldestIssuesToFetch); date.subtract(1, subtract)) {
      issues[date.format(format)] = {
        openedIssues: 0,
        closedIssues: 0,
      };
    }

    // Fetch and retrieve the pages until done
    fetchAndProcessPage(this.githubApi, 50, null);

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
        'owner': owner,
        'repo': repo,
        'numberToFetch': numberOfElementsToFetch
      }).then((res) => {
        // Get data from the response
        const pageInfo = res.data.repository.issues.pageInfo;
        const issuesData = res.data.repository.issues.edges;

        // Need to retrieve more
        let datesAlwaysInRange = true;

        // Process issues
        issuesData.forEach(issueData => {
          const issue = issueData.node;
          
          const author = issue.author.login;
          const createdDate = moment(issue.createdAt);
          const closedDate = moment(issue.closedAt);

          // Add the author if it doesn't exist
          if (authors[author] == null) {
            authors[author] = {
              openedIssues: 0,
              closedIssues: 0,
            }
          }
          
          // If the date is in the range, store it
          if (createdDate.isSameOrAfter(oldestIssuesToFetch)) {
            issues[createdDate.format(format)].openedIssues += 1;
            authors[author].openedIssues += 1;

            // Only consider the closed issue if the date is valid
            if (closedDate.isValid()) {
              issues[closedDate.format(format)].closedIssues += 1;
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
          grouping: dataAgeGrouping,
          format,
          issues,
          authors,
        }

        console.log(JSON.stringify(data, null, 2));
        //dataAreAvailable(data);

        // If there are more pages, retrieve and process them
        if (pageInfo.hasPreviousPage && datesAlwaysInRange) {
          fetchAndProcessPage(githubApi, numberOfElementsToFetch, pageInfo.startCursor);
        } else {
          console.log("Done");
          //endOfData();
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}

module.exports = Agent;
