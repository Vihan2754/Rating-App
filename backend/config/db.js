const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Please make sure MongoDB is running or use MongoDB Atlas');
    console.error('The server will continue running but database operations will fail');
    // Don't exit, just log the error
    // process.exit(1);
  }
};

module.exports = connectDB;