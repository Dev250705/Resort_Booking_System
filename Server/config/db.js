const mongoose = require("mongoose");

let cachedConnection = global.mongoose;

if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
 
  if (cachedConnection.conn) {
    console.log("MongoDB using cached connection");
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, 
    };

    console.log("MongoDB establishing new connection...");
    cachedConnection.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB connected successfully");
      return mongooseInstance;
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
  } catch (e) {
    cachedConnection.promise = null;
    console.log("DB error:", e.message);
    throw e;
  }

  return cachedConnection.conn;
};

module.exports = connectDB;
