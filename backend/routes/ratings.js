const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { authenticate } = require('../middleware/auth');

// Submit or update rating
router.post('/', [
  authenticate,
  body('storeId').notEmpty().withMessage('Store ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only normal users can rate
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only normal users can submit ratings' });
    }

    const { storeId, rating } = req.body;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    let existingRating = await Rating.findOne({
      storeId,
      userId: req.user._id
    });

    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      await existingRating.save();

      // Recalculate average rating
      const sum = (store.averageRating * store.totalRatings) - oldRating + rating;
      store.averageRating = sum / store.totalRatings;
      await store.save();

      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    }

    // Create new rating
    const newRating = new Rating({
      storeId,
      userId: req.user._id,
      rating
    });

    await newRating.save();

    // Update store average rating
    const sum = (store.averageRating * store.totalRatings) + rating;
    store.totalRatings += 1;
    store.averageRating = sum / store.totalRatings;
    await store.save();

    res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's rating for a specific store
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      storeId: req.params.storeId,
      userId: req.user._id
    });

    if (!rating) {
      return res.json({ rating: null });
    }

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;