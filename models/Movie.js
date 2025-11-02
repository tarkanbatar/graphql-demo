const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  id: Number,
  title: String,
  description: String,
  year: Number,
  // Use ObjectId and reference the Director model for proper relations
  directorId: Number,
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;