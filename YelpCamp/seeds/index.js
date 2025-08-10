// seeds/index.js
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities'); // example city data with lat/lng
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground({
      author: '66a99b8df2b01e6ff7e92f5a', // your user ID
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${descriptors[Math.floor(Math.random() * descriptors.length)]} ${places[Math.floor(Math.random() * places.length)]}`,
      image: 'https://source.unsplash.com/collection/483251',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      price
    });

    // 📍 Set coordinates for the marker on the map
    camp.geometry = {
      type: 'Point',
      coordinates: [
        cities[random1000].longitude, // lng
        cities[random1000].latitude   // lat
      ]
    };

    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
