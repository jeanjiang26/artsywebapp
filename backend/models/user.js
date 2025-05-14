//User.js defines fields like email, password, favorites, etc.
//Defines Mongoose schemas
//user model

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String },
  favorites: [
    {
      artistId: { type: String },
      name: { type: String },
      birthday: { type: String },
      deathday: { type: String },
      nationality: { type: String },
      imageUrl: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
