// routes/campgrounds.js
const express = require('express');
const router = express.Router();
const camp = require('../controllers/campgrounds');

router.post('/', camp.createCampground);
router.put('/:id', camp.updateCampground);

module.exports = router;
