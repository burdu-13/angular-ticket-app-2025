const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true
  },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  birthdate: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
