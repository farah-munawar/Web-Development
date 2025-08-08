const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  rating: Number,
  status: {
    type: String,
    enum: ['read', 'to-read'],
    default: 'to-read'
  }
});

module.exports = mongoose.model('Book', bookSchema);
