const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  }
}, {
  timestamps: true
});

// Ensure one rating per user per store
ratingSchema.index({ storeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);