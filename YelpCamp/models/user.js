const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  // username and hashed password will be added automatically
});

UserSchema.plugin(passportLocalMongoose); // adds username, hash, salt + helper methods

module.exports = mongoose.model('User', UserSchema);
