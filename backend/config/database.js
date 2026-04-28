config/database.js
/**
 * Database Configuration
 * MongoDB connection setup (Production-ready)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables");
    }

    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if DB unreachable
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    // 🔁 Event listeners
    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.error('🔴 MongoDB disconnected');
    });

    // 🛑 Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⚠️  SIGINT received. Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ 🚨MongoDB connection failed:", error.message);
    process.exit(1); //  FAIL 
  }
};

module.exports = connectDB;