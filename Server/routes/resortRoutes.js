const express = require("express");
const router = express.Router();
const Resort = require("../models/Resort");

// GET all resorts
router.get("/", async (req, res) => {
  try {
    const resorts = await Resort.find().sort({ _id: -1 });
    res.json(resorts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching resorts" });
  }
});

module.exports = router;