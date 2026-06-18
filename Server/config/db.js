const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  console.log("Connecting to MongoDB...");
  return mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: true, 
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports = connectDB;
