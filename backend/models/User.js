const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
