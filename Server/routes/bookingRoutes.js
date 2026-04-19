const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

// Creates a draft booking and locks inventory
router.post("/checkout", authMiddleware, bookingController.createDraftBooking);

// Fetch logged-in user's bookings
router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);

// Cancel a booking
router.put("/cancel/:id", authMiddleware, bookingController.cancelBooking);
// -- Admin Endpoints --
router.get("/admin/all", authMiddleware, adminMiddleware, bookingController.getAllBookings);
router.put("/admin/:id/status", authMiddleware, adminMiddleware, bookingController.adminUpdateBookingStatus);

module.exports = router;
