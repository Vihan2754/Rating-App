const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    minlength: [20, 'Name must be at least 20 characters'],
    maxlength: [60, 'Name cannot exceed 60 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [400, 'Address cannot exceed 400 characters'],
    trim: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search optimization
storeSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Store', storeSchema);