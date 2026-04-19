const mongoose = require("mongoose");

const exploreContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["amenity", "dining", "gallery"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExploreContent", exploreContentSchema);
