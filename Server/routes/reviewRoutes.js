const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const reviewController = require("../controllers/reviewController");

router.get("/resort/:resortId", reviewController.getReviewsByResort);
router.get(
  "/eligibility/:resortId",
  authMiddleware,
  reviewController.getReviewEligibility
);
router.post("/", authMiddleware, reviewController.createReview);

router.get(
  "/admin/pending",
  authMiddleware,
  adminMiddleware,
  reviewController.listPendingReviews
);
router.patch(
  "/admin/:reviewId/approve",
  authMiddleware,
  adminMiddleware,
  reviewController.approveReview
);
router.delete(
  "/admin/:reviewId",
  authMiddleware,
  adminMiddleware,
  reviewController.rejectReview
);

module.exports = router;
