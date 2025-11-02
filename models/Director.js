const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const directorSchema = new Schema({
  id: Number,
  name: String,
  birth: Number,
});

const Director = mongoose.model('Director', directorSchema);

module.exports = Director;
