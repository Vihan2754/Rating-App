const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Store = require('../models/Store');
const User = require('../models/User');
const Rating = require('../models/Rating');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all stores (accessible to all authenticated users)
router.get('/', authenticate, async (req, res) => {
  try {
    const { name, email, address, sortBy, sortOrder, search } = req.query;
    
    let query = {};
    
    // Search by name or address
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Apply filters
    if (name && !search) query.name = { $regex: name, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (address && !search) query.address = { $regex: address, $options: 'i' };

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const stores = await Store.find(query).sort(sort);

    // If normal user, include their ratings
    if (req.user.role === 'user') {
      const storesWithUserRating = await Promise.all(
        stores.map(async (store) => {
          const userRating = await Rating.findOne({
            storeId: store._id,
            userId: req.user._id
          });
          
          return {
            ...store.toObject(),
            userRating: userRating ? userRating.rating : null
          };
        })
      );
      
      return res.json(storesWithUserRating);
    }

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get store by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('ownerId', 'name email');
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get store ratings (for store owner)
router.get('/:id/ratings', authenticate, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user is the store owner or admin
    if (req.user.role === 'storeOwner' && store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const ratings = await Rating.find({ storeId: req.params.id })
      .populate('userId', 'name email address');

    res.json({
      averageRating: store.averageRating,
      totalRatings: store.totalRatings,
      ratings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new store (admin only)
router.post('/', [
  authenticate,
  authorizeAdmin,
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('address').isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters'),
  body('ownerName').isLength({ min: 20, max: 60 }).withMessage('Owner name must be 20-60 characters'),
  body('ownerEmail').isEmail().withMessage('Please provide a valid owner email'),
  body('ownerPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('ownerAddress').isLength({ max: 400 }).withMessage('Owner address cannot exceed 400 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, ownerName, ownerEmail, ownerPassword, ownerAddress } = req.body;

    // Check if store email exists
    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return res.status(400).json({ message: 'Store email already exists' });
    }

    // Check if owner email exists
    const existingOwner = await User.findOne({ email: ownerEmail });
    if (existingOwner) {
      return res.status(400).json({ message: 'Owner email already exists' });
    }

    // Create owner user
    const owner = new User({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      address: ownerAddress,
      role: 'storeOwner'
    });

    await owner.save();

    // Create store
    const store = new Store({
      name,
      email,
      address,
      ownerId: owner._id
    });

    await store.save();

    // Update owner with storeId
    owner.storeId = store._id;
    await owner.save();

    const populatedStore = await Store.findById(store._id).populate('ownerId', 'name email');

    res.status(201).json(populatedStore);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;