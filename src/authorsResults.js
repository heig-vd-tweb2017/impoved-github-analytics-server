const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the schemas and the models to use with the database
const authorsResultsSchema = new Schema({
  owner: String,
  repo: String,
  date: Date,
  start: Date,
  end: Date,
  age: String,
  bestOpenedIssuesAuthors: Array,
  bestClosedIssuesAuthors: Array,
});

module.exports = mongoose.model('AuthorsResults', authorsResultsSchema);
