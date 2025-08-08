const express = require('express');
const router = express.Router();
const Book = require('../models/book');

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

router.use(requireLogin); 

router.get('/', async (req, res) => {
    const books = await Book.find({});  
    res.render('books/index', { books });

});

// New Book Form
router.get('/new', (req, res) => {
  res.render('books/new');
});

// Create
router.post('/', async (req, res) => {
  await Book.create(req.body.book);
  res.redirect('/books');
});

// Show
router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render('books/show', { book });
});

// Edit
router.get('/:id/edit', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render('books/edit', { book });
});

// Update
router.put('/:id', async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body.book);
  res.redirect(`/books/${req.params.id}`);
});

// Delete
router.delete('/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/books');
});

module.exports = router;
