const mongoose = require('mongoose');               
const Schema = mongoose.Schema;                 

const campgroundSchema = new Schema({              
  title: String,
  price: Number,
  location: String,
  image: String,
  description: String,
});

module.exports = mongoose.model('Campground', campgroundSchema); 