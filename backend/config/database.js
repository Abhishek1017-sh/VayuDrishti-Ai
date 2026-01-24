/**
 * Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vayudrishti';
    
    await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected (but continuing...)');
      // DON'T exit - this happens during errors
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, closing MongoDB...');
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Continuing with in-memory storage...');
  }
};

module.exports = connectDB;
