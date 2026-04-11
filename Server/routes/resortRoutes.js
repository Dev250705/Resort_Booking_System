const express = require("express");
const router = express.Router();
const resortController = require("../controllers/resortController");

// GET all resorts or Search resorts via Query Params
// Example search: /api/resorts?checkIn=...&checkOut=...&guests=4&rooms=2
router.get("/", resortController.searchResorts);

// GET a single resort detail by ID
router.get("/:id", resortController.getResortById);

module.exports = router;