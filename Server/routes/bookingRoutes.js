const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Reusable middleware to verify token (same as paymentRoutes)
const authCheck = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  if (token.startsWith("Bearer ")) token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Set user ID
    next();
  } catch (ex) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Creates a draft booking and locks inventory
router.post("/checkout", authCheck, bookingController.createDraftBooking);

// Fetch logged-in user's bookings
router.get("/my-bookings", authCheck, bookingController.getMyBookings);

// Cancel a booking
router.put("/cancel/:id", authCheck, bookingController.cancelBooking);

module.exports = router;
