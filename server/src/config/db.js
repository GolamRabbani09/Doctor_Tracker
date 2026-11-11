const mongoose = require('mongoose');

/**
 * Connect to MongoDB with automated retry logic and event logging.
 * @param {number} maxRetries Maximum number of reconnection attempts on initial connect
 * @param {number} retryInterval Interval in milliseconds between retries
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (maxRetries = 5, retryInterval = 5000) => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctor_tracker';

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Connection re-established.');
  });

  let retries = 0;
  while (retries < maxRetries) {
    try {
      console.log(`[MongoDB] Connecting to ${mongoURI}... (Attempt ${retries + 1}/${maxRetries})`);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
      });
      return conn;
    } catch (error) {
      retries += 1;
      console.error(`[MongoDB] Connection failed: ${error.message}`);
      if (retries >= maxRetries) {
        console.error('[MongoDB] Max retries reached. Database unavailable.');
        throw error;
      }
      console.log(`[MongoDB] Retrying in ${retryInterval / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
};

module.exports = connectDB;
