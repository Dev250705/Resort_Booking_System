const Resort = require("../models/Resort");
const Booking = require("../models/Booking");

exports.getAllResorts = async (req, res) => {
  try {
    const resorts = await Resort.find().sort({ _id: -1 });
    res.json(resorts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching resorts" });
  }
};

exports.searchResorts = async (req, res) => {
  try {
    const { checkIn, checkOut, guests, rooms } = req.query;
    
    // Default to getAll behavior if parameters aren't provided
    if (!checkIn || !checkOut || !guests || !rooms) {
      const resorts = await Resort.find().sort({ _id: -1 });
      return res.json(resorts);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const roomsNeeded = parseInt(rooms);
    const guestsNeeded = parseInt(guests);

    // 1. Math Check: Find overlapping bookings 
    // An overlapping booking is one where CheckIn is before our CheckOut
    // AND CheckOut is after our CheckIn.
    const now = new Date();
    const overlappingBookings = await Booking.find({
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
      $or: [
        { status: "Confirmed" },
        { status: "Pending_Payment", tempLockExpiresAt: { $gt: now } },
      ],
    });

    const resorts = await Resort.find();
    const availableResorts = [];

    // 2. Room Level Availability Math Iteration
    for (const resort of resorts) {
      let filteredRoomTypes = [];

      for (const room of resort.roomTypes) {
        // Is this room type physically large enough for the requested guest density?
        // Eq: 5 guests, 2 rooms -> Requires rooms that can hold at least Math.ceil(5/2) = 3 guests each.
        const requiredCapacityPerRoom = Math.ceil(guestsNeeded / roomsNeeded);
        
        if (room.maxGuests >= requiredCapacityPerRoom) {
           
           // Count how many of THIS specific room are currently booked
           const bookedRoomsCount = overlappingBookings
             .filter(b => b.resort.toString() === resort._id.toString() && b.roomTypeTitle === room.title)
             .reduce((sum, b) => sum + b.quantity, 0);
             
           // Critical math: Total Rooms - Booked Rooms
           const availableInventory = room.inventoryCount - bookedRoomsCount;
           
           if (availableInventory >= roomsNeeded) {
             const nights = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
             // Push valid available rooms back to the client
             filteredRoomTypes.push({
               ...room.toObject(),
               availableInventory,
               calculatedTotalPrice: room.basePrice * roomsNeeded * nights
             });
           }
        }
      }

      // If at least one room type matches their need, the Resort is "Available"
      if (filteredRoomTypes.length > 0) {
        const resortData = resort.toObject();
        resortData.roomTypes = filteredRoomTypes;
        availableResorts.push(resortData);
      }
    }

    res.json(availableResorts);

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Error searching for available resorts" });
  }
};

exports.getResortById = async (req, res) => {
  try {
    const { id } = req.params;
    const resort = await Resort.findById(id);
    if (!resort) {
      return res.status(404).json({ message: "Resort not found" });
    }
    res.json(resort);
  } catch (err) {
    console.error("Error fetching resort by id:", err);
    res.status(500).json({ message: "Error fetching resort details" });
  }
};
