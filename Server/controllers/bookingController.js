const Booking = require("../models/Booking");
const Resort = require("../models/Resort");
const Review = require("../models/Review");
const stayPolicy = require("../utils/stayPolicy");

exports.createDraftBooking = async (req, res) => {
  try {
    const { resortId, roomTypeTitle, quantity, checkInDate, checkOutDate, totalGuests, addons, guestName, guestEmail, guestPhone } = req.body;
    
    // Auth Middleware will ideally provide `req.user.id`. Using a placeholder if absent.
    const userId = req.user ? req.user.id : req.body.userId;
    
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // 1. Double Check Availability (Concurrency Prevention!)
    // We must ensure the room hasn't been grabbed in the seconds it took the user to press "Pay".
    const now = new Date();
    const overlappingBookings = await Booking.find({
      resort: resortId,
      roomTypeTitle: roomTypeTitle,
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      $or: [
        { status: "Confirmed" },
        { status: "Pending_Payment", tempLockExpiresAt: { $gt: now } },
      ],
    });

    const bookedRoomsCount = overlappingBookings.reduce((sum, b) => sum + b.quantity, 0);

    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    // Validate if the room exists
    const roomTypeParams = resort.roomTypes.find(rt => rt.title === roomTypeTitle);
    if (!roomTypeParams) return res.status(404).json({ message: "Room type not found in this resort" });

    // Math Check
    const availableInventory = roomTypeParams.inventoryCount - bookedRoomsCount;
    if (availableInventory < quantity) {
      return res.status(409).json({ 
        message: `Collision Detected! Only ${availableInventory} rooms available. Someone might have just booked them!` 
      });
    }

    // 2. Final Pricing Check Backend-side (Never trust frontend math entirely)
    const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    let calculatedAmount = roomTypeParams.basePrice * quantity * (nights > 0 ? nights : 1);

    const parsedAddons = addons || [];
    let addonsTotal = 0;
    parsedAddons.forEach(addon => {
      addonsTotal += (addon.price * (addon.quantity || 1));
    });
    calculatedAmount += addonsTotal;
    
    // Taxes (18%)
    const taxes = calculatedAmount * 0.18;
    calculatedAmount += Math.round(taxes);

    // 3. Create Draft Booking with Temporary 10-Minute Lock
    const newBooking = new Booking({
      user: userId,
      resort: resortId,
      roomTypeTitle,
      quantity,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalGuests,
      totalAmount: calculatedAmount,
      addons: addons || [],
      guestName,
      guestEmail,
      guestPhone,
      status: "Pending_Payment",
      
      // TTL Index kicks in exactly 10 minutes from NOW
      tempLockExpiresAt: new Date(Date.now() + 10 * 60 * 1000) 
    });

    await newBooking.save();

    res.status(201).json({ 
      success: true,
      message: "Booking temporarily locked for 10 minutes. Please proceed to payment.", 
      booking: newBooking 
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ message: "Server Error during checkout process" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ 
      user: userId,
      status: { $ne: "Pending_Payment" }
    })
      .populate("resort", "name images location")
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((b) => b._id);
    const reviewRows =
      bookingIds.length === 0
        ? []
        : await Review.find({ booking: { $in: bookingIds } })
            .select("booking isApproved")
            .lean();
    const reviewByBooking = new Map(
      reviewRows.map((row) => [String(row.booking), row])
    );

    const bookingsOut = bookings.map((b) => {
      const plain = b.toObject();
      const rev = reviewByBooking.get(String(b._id));
      plain.hasReview = Boolean(rev);
      plain.reviewPending = Boolean(rev && !rev.isApproved);
      plain.reviewApproved = Boolean(rev && rev.isApproved);
      return plain;
    });

    res.status(200).json({ success: true, bookings: bookingsOut });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server Error fetching user bookings" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not authorized." });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled." });
    }

    if (stayPolicy.isStayCompletedByCheckoutDate(booking.checkOutDate)) {
      return res.status(400).json({
        message:
          "This stay has already ended (check-out was 11:00 AM on your check-out day); it cannot be cancelled.",
      });
    }

    if (stayPolicy.isCheckInStartedByCheckInDate(booking.checkInDate)) {
      return res.status(400).json({
        message:
          "Cancellations are not allowed after check-in time (2:00 PM on check-in day), per property policy.",
      });
    }

    if (!stayPolicy.canUserCancelBooking(booking)) {
      return res.status(400).json({ message: "This booking cannot be cancelled." });
    }

    const cancellationPenaltyApplies =
      stayPolicy.isWithin48HoursBeforePolicyCheckIn(booking.checkInDate);

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking successfully cancelled.",
      cancellationPenaltyApplies,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server Error cancelling the booking." });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("resort", "name location")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching all bookings for admin:", error);
    res.status(500).json({ message: "Server Error fetching bookings" });
  }
};

exports.adminUpdateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    if (!["Confirmed", "Cancelled", "Pending_Payment", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();
    res.status(200).json({ success: true, message: `Booking marked as ${status}` });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
};
