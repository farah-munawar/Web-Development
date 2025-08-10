// controllers/campgrounds.js (or directly in routes if you’re not using controllers)
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Campground = require('../models/campground');

const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

// CREATE

exports.createCampground = async (req, res, next) => {
  try {
    // req.body.campground should include { title, price, location, image }
    const { campground } = req.body;

    // Geocode the location string -> [lng, lat]
    const geo = await geocoder.forwardGeocode({
      query: campground.location,
      limit: 1
    }).send();

    const feature = geo.body.features[0];
    const coords = feature ? feature.center : null; // [lng, lat]

    const doc = new Campground(campground);
    if (coords) {
      doc.geometry = { type: 'Point', coordinates: coords };
    }

    await doc.save();
    res.redirect(`/campgrounds/${doc._id}`);
  } catch (e) {
    next(e);
  }
};

// UPDATE
exports.updateCampground = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { campground } = req.body;
    const doc = await Campground.findByIdAndUpdate(id, campground, { new: true });

    // If location was changed, refresh geometry
    if (campground.location) {
      const geo = await geocoder.forwardGeocode({
        query: campground.location,
        limit: 1
      }).send();
      const feature = geo.body.features[0];
      if (feature) {
        doc.geometry = { type: 'Point', coordinates: feature.center }; // [lng, lat]
        await doc.save();
      }
    }

    res.redirect(`/campgrounds/${doc._id}`);
  } catch (e) {
    next(e);
  }
};
