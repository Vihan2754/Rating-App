const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Authorize admin
exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Authorize store owner
exports.authorizeStoreOwner = (req, res, next) => {
  if (req.user.role !== 'storeOwner') {
    return res.status(403).json({ message: 'Access denied. Store owner only.' });
  }
  next();
};

// Authorize user (normal user)
exports.authorizeUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied. User only.' });
  }
  next();
};