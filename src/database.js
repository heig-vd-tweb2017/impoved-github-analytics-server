const mongoose = require('mongoose');

class Database {
  /**
   * The constructor.
   * @param {string} hostname The database's hostname.
   * @param {string} schemaName The schema's name.
   */
  constructor(mongodbUri) {
    mongoose.connect(`mongodb://${mongodbUri}`, {
      useMongoClient: true,
    });
    mongoose.Promise = global.Promise;

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      // Create the schemas and the models to use with the database
      const authorsResultsSchema = mongoose.Schema({
        owner: String,
        repo: String,
        date: Date,
        start: Date,
        end: Date,
        age: String,
        bestOpenedIssuesAuthors: Array,
        bestClosedIssuesAuthors: Array,
      });

      this.AuthorsResults = mongoose.model('AuthorResults', authorsResultsSchema);
    });
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
        const authorsResults = new this.AuthorsResults({
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

  getAuthorsResults(owner, repo) {
    return new Promise((resolve, reject) => {
      if (owner == null || repo == null) {
        reject();
      } else {
        // Find the the old authors results
        this.AuthorsResults
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
}

module.exports = Database;
