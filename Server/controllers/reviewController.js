const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Resort = require("../models/Resort");
const stayPolicy = require("../utils/stayPolicy");

async function syncResortRatingFromApprovedReviews(resortId) {
  const agg = await Review.aggregate([
    {
      $match: {
        resort: new mongoose.Types.ObjectId(resortId),
        isApproved: true,
      },
    },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  if (agg[0]?.avgRating != null) {
    const rounded = Math.round(agg[0].avgRating * 10) / 10;
    await Resort.findByIdAndUpdate(resortId, { rating: rounded });
  } else {
    await Resort.findByIdAndUpdate(resortId, { rating: 0 });
  }
}

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined || rating === null || !comment) {
      return res.status(400).json({
        message: "bookingId, rating, and comment are required",
      });
    }

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
    }

    const text = String(comment).trim();
    if (text.length < 3) {
      return res.status(400).json({ message: "Comment must be at least 3 characters" });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: "Comment is too long (max 2000 characters)" });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Confirmed" && booking.status !== "Completed") {
      return res.status(400).json({
        message: "Only confirmed or completed stays can be reviewed",
      });
    }

    if (booking.status !== "Completed" && !stayPolicy.isStayCompletedByCheckoutDate(booking.checkOutDate)) {
      return res.status(400).json({
        message:
          "You can leave a review after check-out (11:00 AM on your check-out day), per property policy",
      });
    }

    const duplicate = await Review.findOne({ booking: bookingId });
    if (duplicate) {
      return res.status(400).json({ message: "You have already submitted a review for this stay" });
    }

    await Review.create({
      user: userId,
      resort: booking.resort,
      booking: bookingId,
      rating: r,
      comment: text,
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message:
        "Thank you! Your review was sent for approval. It will appear after an admin confirms it.",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already submitted a review for this stay" });
    }
    console.error("createReview:", err);
    res.status(500).json({ message: "Could not submit review" });
  }
};

exports.getReviewEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resortId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(resortId)) {
      return res.status(400).json({ message: "Invalid resort id" });
    }

    const bookings = await Booking.find({
      user: userId,
      resort: resortId,
      status: { $in: ["Confirmed", "Completed"] },
    })
      .sort({ checkOutDate: -1 })
      .lean();

    let anyPending = false;
    for (const b of bookings) {
      if (b.status !== "Completed" && !stayPolicy.isStayCompletedByCheckoutDate(b.checkOutDate)) continue;
      const rev = await Review.findOne({ booking: b._id }).select("isApproved").lean();
      if (!rev) {
        return res.json({
          eligible: true,
          bookingId: String(b._id),
          pendingReview: false,
        });
      }
      if (rev.isApproved === false) anyPending = true;
    }

    if (anyPending) {
      return res.json({ eligible: false, pendingReview: true, bookingId: null });
    }

    res.json({ eligible: false, pendingReview: false, bookingId: null });
  } catch (err) {
    console.error("getReviewEligibility:", err);
    res.status(500).json({ message: "Could not check review eligibility" });
  }
};

exports.getReviewsByResort = async (req, res) => {
  try {
    const { resortId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(resortId)) {
      return res.status(400).json({ message: "Invalid resort id" });
    }

    const reviews = await Review.find({ resort: resortId, isApproved: true })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const agg = await Review.aggregate([
      {
        $match: {
          resort: new mongoose.Types.ObjectId(resortId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = agg[0] || { avgRating: null, count: 0 };
    const avg =
      summary.count > 0 ? Math.round(summary.avgRating * 10) / 10 : null;

    res.json({
      success: true,
      reviews: reviews.map((rev) => ({
        _id: rev._id,
        rating: rev.rating,
        comment: rev.comment,
        createdAt: rev.createdAt,
        userName: rev.user?.name || "Guest",
      })),
      averageRating: avg,
      reviewCount: summary.count,
    });
  } catch (err) {
    console.error("getReviewsByResort:", err);
    res.status(500).json({ message: "Could not load reviews" });
  }
};

exports.listPendingReviews = async (req, res) => {
  try {
    const list = await Review.find({ isApproved: false })
      .populate("user", "name email")
      .populate("resort", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reviews: list.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: r.user?.name || "Guest",
        userEmail: r.user?.email || "",
        resortName: r.resort?.name || "Resort",
        resortId: r.resort?._id,
        bookingId: r.booking,
      })),
    });
  } catch (err) {
    console.error("listPendingReviews:", err);
    res.status(500).json({ message: "Could not load pending reviews" });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (review.isApproved) {
      return res.status(400).json({ message: "Review is already approved" });
    }

    review.isApproved = true;
    await review.save();

    await syncResortRatingFromApprovedReviews(review.resort);

    res.json({ success: true, message: "Review approved and published" });
  } catch (err) {
    console.error("approveReview:", err);
    res.status(500).json({ message: "Could not approve review" });
  }
};

exports.rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (review.isApproved) {
      return res.status(400).json({ message: "Cannot reject an already published review" });
    }

    const resortId = review.resort;
    await Review.deleteOne({ _id: reviewId });
    await syncResortRatingFromApprovedReviews(resortId);

    res.json({ success: true, message: "Review rejected and removed" });
  } catch (err) {
    console.error("rejectReview:", err);
    res.status(500).json({ message: "Could not reject review" });
  }
};
