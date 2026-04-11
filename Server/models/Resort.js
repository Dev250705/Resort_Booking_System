const mongoose = require("mongoose");

// Room Type Sub-Document
const roomTypeSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Standard Room", "Pool Villa"
  description: { type: String },
  maxGuests: { type: Number, required: true }, // Crucial for capacity math
  basePrice: { type: Number, required: true },
  inventoryCount: { type: Number, required: true }, // Total physical rooms of this type available
  amenities: [{ type: String }],
  categorizedAmenities: [
    {
      category: String,
      items: [String]
    }
  ],
  images: [{ type: String }],
});

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
  
  // Room level inventory replaces old flat price
  roomTypes: [roomTypeSchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resort", resortSchema);
