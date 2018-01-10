/*
eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "saveAuthorsResults",
    "getAuthorsResults"
  ]
}]
*/

const mongoose = require('mongoose');
const AuthorsResults = require('./authorsResults.js');

class Database {
  /**
   * The constructor.
   * @param {string} hostname The database's hostname.
   * @param {string} schemaName The schema's name.
   */
  constructor(mongodbUri) {
    mongoose.connect(mongodbUri, {
      useMongoClient: true,
    });
    mongoose.Promise = Promise;

    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'connection error:'));
  }

  /**
   * Save data to the database.
   * @param {JSON} data The data to save in the database.
   */
  saveAuthorsResults(data) {
    return new Promise((resolve, reject) => {
      if (data == null) {
        reject();
      } else {
        // Get the fields from the data object
        const {
          owner, repo, date, start, end, age, bestOpenedIssuesAuthors, bestClosedIssuesAuthors,
        } = data;

        // Create the model object
        const authorsResults = AuthorsResults({
          owner,
          repo,
          date,
          start,
          end,
          age,
          bestOpenedIssuesAuthors,
          bestClosedIssuesAuthors,
        });

        // Save it
        authorsResults.save((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  /**
   * Get data from the database.
   * @param {String} owner The repo's owner.
   * @param {String} repo The repository.
   */
  getAuthorsResults(owner, repo) {
    return new Promise((resolve, reject) => {
      if (owner == null || repo == null) {
        reject();
      } else {
        // Find the the old authors results
        AuthorsResults
          .find({
            owner,
            repo,
          })
          .select({
            _id: 0,
            __v: 0,
          })
          .sort({
            date: -1,
            start: -1,
          })
          .then((results) => {
            resolve(results);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;
