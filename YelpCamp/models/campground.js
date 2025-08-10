const mongoose = require('mongoose');
const Review = require('./review');

const campgroundSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
  latitude: Number,  // Add latitude
  longitude: Number,
   geometry: {              // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    }},
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

// Mongoose middleware: triggered after `findByIdAndDelete`
campgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews }
    });
  }
});

module.exports = mongoose.model('Campground', campgroundSchema);
