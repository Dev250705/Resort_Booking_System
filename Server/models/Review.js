const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resort: { type: mongoose.Schema.Types.ObjectId, ref: "Resort", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, // Ensures verified stay
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  
  // Auto-published for verified guests, but admin can hide them later
  isApproved: {
    type: Boolean,
    default: true, 
  },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
