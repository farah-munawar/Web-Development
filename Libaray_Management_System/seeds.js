const mongoose = require('mongoose');
const Book = require('./models/book'); // adjust path if needed

mongoose.connect('mongodb://localhost:27017/bookTracker')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Mongo Error:', err));

const sampleBooks = [
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    rating: 5,
    status: "read"
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    rating: 5,
    status: "read"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic",
    rating: 5,
    status: "read"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    rating: 4,
    status: "to-read"
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    rating: 4,
    status: "to-read"
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    genre: "Nonfiction",
    rating: 4,
    status: "read"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    rating: 5,
    status: "read"
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    genre: "Finance",
    rating: 3,
    status: "to-read"
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Classic",
    rating: 3,
    status: "read"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    rating: 5,
    status: "to-read"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic",
    rating: 4,
    status: "read"
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "History",
    rating: 5,
    status: "to-read"
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    genre: "Spirituality",
    rating: 4,
    status: "to-read"
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Dystopian",
    rating: 5,
    status: "read"
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    genre: "Motivation",
    rating: 4,
    status: "to-read"
  }
];

async function seedDB() {
  await Book.deleteMany({});
  await Book.insertMany(sampleBooks);
  console.log("✅ Seeded 15 books successfully!");
  mongoose.connection.close();
}

seedDB();
