const mongoose = require("mongoose");

const resortSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  location: {
    city: String,
    state: String,
    address: String,
  },

  description: {
    type: String,
  },

  amenities: [
    {
      type: String,
    },
  ],

  images: [
    {
      type: String,
    },
  ],

  rating: {
    type: Number,
    default: 0,
  },

  totalRooms: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Resort", resortSchema);
