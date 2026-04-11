const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Explicitly using family: 4 to prioritize IPv4, ensuring 'localhost' doesn't fail on IPv6 (::1)
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log("DB error:", error.message);
  }
};

module.exports = connectDB;