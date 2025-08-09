const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user'); // ✅ User model
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const joi = require('joi');

// DB Connect
mongoose.connect('mongodb://localhost:27017/yelpcamp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// ✅ Session Setup
const sessionConfig = {
  secret: 'yoursecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));

// ✅ Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Middleware to pass user info to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ✅ Validation Middleware
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
    const msg = error.details.map(el => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  next();
};

// ✅ Authentication Check
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

// ROUTES

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/campgrounds');
  }
  res.render('landing'); // a minimal login/register card page
});


// ✅ Register
app.get('/register', (req, res) => {
  res.render('users/register');
});

app.post('/register', catchAsync(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      res.redirect('/campgrounds');
    });
  } catch (e) {
    next(e);
  }
}));

// ✅ Login
app.get('/login', (req, res) => {
  res.render('users/login');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/campgrounds');
});

// ✅ Logout
app.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login'); // or '/' or wherever
  });
});


// Campground routes
app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  if (!campground) throw new ExpressError('Campground not found', 404);
  res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true });
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', isLoggedIn, catchAsync(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  res.redirect('/campgrounds');
}));

// Reviews
app.post('/campgrounds/:id/reviews', isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
