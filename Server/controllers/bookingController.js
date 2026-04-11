const Booking = require("../models/Booking");
const Resort = require("../models/Resort");

exports.createDraftBooking = async (req, res) => {
  try {
    const { resortId, roomTypeTitle, quantity, checkInDate, checkOutDate, totalGuests } = req.body;
    
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

    // 2. Final Pricing Check Backend-side (Never trust frontend math)
    const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    const calculatedAmount = roomTypeParams.basePrice * quantity * nights;

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
    const bookings = await Booking.find({ user: userId })
      .populate("resort", "name images location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
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

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking successfully cancelled." });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server Error cancelling the booking." });
  }
};
