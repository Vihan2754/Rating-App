const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.use(authenticate, authorizeAdmin);

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with filters and sorting
router.get('/', async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;
    
    let query = {};
    
    // Apply filters
    if (name) query.name = { $regex: name, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (address) query.address = { $regex: address, $options: 'i' };
    if (role) query.role = role;

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('storeId', 'name averageRating')
      .sort(sort);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('storeId', 'name averageRating');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new user (admin/storeOwner)
router.post('/', [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('address').isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters'),
  body('role').isIn(['admin', 'user', 'storeOwner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role, storeName, storeAddress, storeEmail } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      address,
      role
    });

    // If creating a store owner, create store
    if (role === 'storeOwner') {
      if (!storeName || !storeAddress || !storeEmail) {
        return res.status(400).json({ message: 'Store details are required for store owner' });
      }

      // Check if store email exists
      const existingStore = await Store.findOne({ email: storeEmail });
      if (existingStore) {
        return res.status(400).json({ message: 'Store email already exists' });
      }

      await user.save();

      const store = new Store({
        name: storeName,
        email: storeEmail,
        address: storeAddress,
        ownerId: user._id
      });

      await store.save();
      user.storeId = store._id;
      await user.save();
    } else {
      await user.save();
    }

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('storeId');

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;