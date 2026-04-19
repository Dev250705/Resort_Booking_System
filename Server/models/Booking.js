const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resort: { type: mongoose.Schema.Types.ObjectId, ref: "Resort", required: true },
  
  // Specific room details booked
  roomTypeTitle: { type: String, required: true }, 
  quantity: { type: Number, required: true },
  
  // Dates
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  
  // Guest Info
  guestName: { type: String },
  guestEmail: { type: String },
  guestPhone: { type: String },
  
  // Financials
  totalGuests: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  addons: [{
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  }],
  
  // Concurrency & Status
  status: {
    type: String,
    enum: ["Draft", "Pending_Payment", "Confirmed", "Cancelled", "Expired"],
    default: "Pending_Payment",
  },
  
  // Temporary lock: MongoDB TTL index. This document will auto-expire if status is still Pending_Payment 
  tempLockExpiresAt: { type: Date },

}, { timestamps: true });

// Create a TTL index that automatically deletes the document AFTER 0 seconds of the time stored in tempLockExpiresAt
// When payment succeeds, our backend logic will execute `$unset: { tempLockExpiresAt: 1 }` to make it permanent.
bookingSchema.index({ tempLockExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Booking", bookingSchema);
