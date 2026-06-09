const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  avatar: { type: String, default: '' },
  upiId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);