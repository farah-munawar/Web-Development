const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground'); 
const Review = require('./models/review'); // ✅ Needed for reviews
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError'); 
const joi = require('joi');

mongoose.connect('mongodb://localhost:27017/yelpcamp')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected successfully');
});

app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// ✅ Campground validation middleware
const validateCampground = (req, res, next) => {
  const campgroundSchema = joi.object({
    campground: joi.object({
      title: joi.string().required(),
      price: joi.number().required().min(0),
      location: joi.string().required(),
      image: joi.string().required(),
      description: joi.string().required()
    }).required()
  });

  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map(el => el.message).join(', ');
    return next(new ExpressError(message, 400));
  }
  next();
};


// Routes

app.get('/', (req, res) => {
  res.render('home');
});

// INDEX
app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

// NEW FORM
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// CREATE
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();  
  res.redirect(`/campgrounds/${campground._id}`);
}));

// SHOW — FIXED (removed duplicate)
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  if (!campground) {
    throw new ExpressError("Campground not found", 404);
  }
  res.render('campgrounds/show', { campground });
}));

// EDIT FORM
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
}));

// UPDATE
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
  res.redirect(`/campgrounds/${campground._id}`);
}));

// DELETE
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

// REVIEW CREATE — FIXED
app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review); // ⬅️ requires review[rating] and review[body]
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}));

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err });
});

// Server Start
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
