const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  comments: { type: String, required: true },
  status: { type: String, enum: ["New", "Read", "Replied"], default: "New" },
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
