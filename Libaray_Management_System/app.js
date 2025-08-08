const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth'); // ✅ NEW
const app = express();

mongoose.connect('mongodb://localhost:27017/bookTracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.use(session({
  secret: 'superSecretLibraryKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/bookTracker',
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});

app.use(authRoutes);      
app.use('/books', bookRoutes); 

app.get('/', (req, res) => res.redirect('/books'));

app.listen(3000, () => console.log('App running on http://localhost:3000'));
