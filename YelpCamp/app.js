const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground'); 
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
app.use(express.static('public'));
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError'); 
const joi= require('joi');

mongoose.connect('mongodb://localhost:27017/yelpcamp')
  .then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Database connected successfully');
});
app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method')); 


app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({}); 
  res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
}); 

app.post('/campgrounds',catchAsync( async (req, res,next) => {
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
    return next(new ExpressError(error.details[0].message, 400));
  }
  const campground = new Campground(req.body.campground);
  await campground.save();  
  res.redirect(`/campgrounds/${campground._id}`); }
));

app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground });
});
app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});
app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
  res.redirect(`/campgrounds/${campground._id}`);
});
app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});
app.get('/', (req, res) => {
  res.render('home');
});


app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err }); // ✅ pass error object
});
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
