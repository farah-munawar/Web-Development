const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Show Register Form
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register New User
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await User.create({ username, password });
  res.redirect('/login');
});

// Show Login Form
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Handle Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await user.comparePassword(password)) {
    req.session.userId = user._id;
    res.redirect('/books');
  } else {
    res.send("Invalid username or password");
  }
});

// Handle Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
