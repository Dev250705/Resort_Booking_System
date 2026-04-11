const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  
  status: {
    type: String,
    enum: ["Created", "Success", "Failed", "Refunded"],
    default: "Created",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
