const Resort = require("../models/Resort");
const Booking = require("../models/Booking");

/** Confirmed stays + active payment locks that overlap [checkIn, checkOut). Cancelled/Expired excluded. */
async function getOverlappingBookingsForRange(checkInDate, checkOutDate) {
  const now = new Date();
  return Booking.find({
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
    $or: [
      { status: "Confirmed" },
      { status: "Pending_Payment", tempLockExpiresAt: { $gt: now } },
    ],
  });
}

function attachAvailabilityToRoomTypes(resortDoc, overlappingBookings) {
  const rid = resortDoc._id.toString();
  const plain = resortDoc.toObject();
  plain.roomTypes = plain.roomTypes.map((room) => {
    const bookedRoomsCount = overlappingBookings
      .filter(
        (b) =>
          b.resort.toString() === rid && b.roomTypeTitle === room.title
      )
      .reduce((sum, b) => sum + b.quantity, 0);
    const availableInventory = Math.max(0, room.inventoryCount - bookedRoomsCount);
    return { ...room, availableInventory, bookedRoomsCount };
  });
  return plain;
}

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
    
    if (checkOutDate <= checkInDate) {
      checkOutDate.setDate(checkInDate.getDate() + 1);
    }

    const roomsNeeded = parseInt(rooms);
    const guestsNeeded = parseInt(guests);

    // 1. Math Check: Find overlapping bookings 
    // An overlapping booking is one where CheckIn is before our CheckOut
    // AND CheckOut is after our CheckIn.
    const overlappingBookings = await getOverlappingBookingsForRange(
      checkInDate,
      checkOutDate
    );

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
    const { checkIn, checkOut } = req.query;

    const resort = await Resort.findById(id);
    if (!resort) {
      return res.status(404).json({ message: "Resort not found" });
    }

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
        return res.status(400).json({ message: "Invalid checkIn or checkOut" });
      }
      
      if (checkOutDate <= checkInDate) {
        checkOutDate.setDate(checkInDate.getDate() + 1);
      }
      const overlappingBookings = await getOverlappingBookingsForRange(
        checkInDate,
        checkOutDate
      );
      return res.json(attachAvailabilityToRoomTypes(resort, overlappingBookings));
    }

    res.json(resort);
  } catch (err) {
    console.error("Error fetching resort by id:", err);
    res.status(500).json({ message: "Error fetching resort details" });
  }
};

exports.createResort = async (req, res) => {
  try {
    const payload = req.body;
    let images = [];
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        images.push(`/uploads/${req.files.coverImage[0].filename}`);
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        req.files.galleryImages.forEach(file => {
          images.push(`/uploads/${file.filename}`);
        });
      }
    }

    let roomTypes = [];
    if (payload.basePrice) {
      roomTypes = [{
          title: "Standard Room",
          maxGuests: 4,
          basePrice: Number(payload.basePrice),
          inventoryCount: Number(payload.inventory) || 5
      }];
    }

    const resortData = {
      name: payload.name,
      location: { city: payload.city },
      description: payload.description || "",
      amenities: payload.amenities ? payload.amenities.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean) : [],
      images: images,
      roomTypes: roomTypes
    };

    const newResort = new Resort(resortData);
    await newResort.save();
    res.status(201).json({ success: true, resort: newResort });
  } catch (err) {
    console.error("Error creating resort:", err);
    res.status(500).json({ message: "Error creating resort" });
  }
};

exports.updateResort = async (req, res) => {
  try {
    const updatedResort = await Resort.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedResort) return res.status(404).json({ message: "Resort not found" });
    res.status(200).json({ success: true, resort: updatedResort });
  } catch (err) {
    console.error("Error updating resort:", err);
    res.status(500).json({ message: "Error updating resort" });
  }
};

exports.deleteResort = async (req, res) => {
  try {
    const deletedResort = await Resort.findByIdAndDelete(req.params.id);
    if (!deletedResort) return res.status(404).json({ message: "Resort not found" });
    res.status(200).json({ success: true, message: "Resort deleted successfully" });
  } catch (err) {
    console.error("Error deleting resort:", err);
  }
};

exports.addRoomType = async (req, res) => {
  try {
    const resortId = req.params.id;
    const roomData = req.body;
    
    if (req.files && req.files.length > 0) {
      roomData.images = req.files.map(file => `/uploads/${file.filename}`);
    } else {
      roomData.images = [];
    }
    
    // Parse strings back to numbers if needed (FormData sends strings)
    if (roomData.basePrice) roomData.basePrice = Number(roomData.basePrice);
    if (roomData.inventoryCount) roomData.inventoryCount = Number(roomData.inventoryCount);
    if (roomData.maxGuests) roomData.maxGuests = Number(roomData.maxGuests);
    if (roomData.amenities && typeof roomData.amenities === 'string') {
      roomData.amenities = roomData.amenities.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean);
    }

    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    resort.roomTypes.push(roomData);
    await resort.save();

    res.status(201).json({ success: true, message: "Room added", resort });
  } catch (err) {
    console.error("Error adding room:", err);
    res.status(500).json({ message: "Error adding room" });
  }
};

exports.removeRoomType = async (req, res) => {
  try {
    const { id: resortId, roomId } = req.params;
    
    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    resort.roomTypes = resort.roomTypes.filter(r => r._id.toString() !== roomId);
    await resort.save();

    res.status(200).json({ success: true, message: "Room removed", resort });
  } catch (err) {
    console.error("Error removing room:", err);
    res.status(500).json({ message: "Error removing room" });
  }
};

exports.updateRoomType = async (req, res) => {
  try {
    const { id: resortId, roomId } = req.params;
    const bodyArgs = req.body || {};

    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    const room = resort.roomTypes.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (bodyArgs.amenities !== undefined) {
      if (typeof bodyArgs.amenities === 'string') {
        room.amenities = bodyArgs.amenities.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean);
      } else if (Array.isArray(bodyArgs.amenities)) {
        room.amenities = bodyArgs.amenities;
      }
    }
    
    await resort.save();
    res.json({ success: true, message: "Room updated", resort });
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ message: "Error updating room" });
  }
};

exports.addResortImages = async (req, res) => {
  try {
    const resortId = req.params.id;
    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      resort.images = [...(resort.images || []), ...newImages];
      await resort.save();
    }
    
    res.status(200).json({ success: true, message: "Images added", resort });
  } catch (err) {
    console.error("Error adding resort images:", err);
    res.status(500).json({ message: "Error adding resort images" });
  }
};

exports.removeResortImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.query;

    const resort = await Resort.findById(id);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    if (imageUrl) {
      const updatedResort = await Resort.findByIdAndUpdate(
        id,
        { $pull: { images: imageUrl } },
        { new: true }
      );
      return res.status(200).json({ success: true, message: "Image removed", resort: updatedResort });
    }

    res.status(200).json({ success: true, message: "No image removed", resort });
  } catch (err) {
    console.error("Error removing resort image:", err);
    res.status(500).json({ message: "Error removing resort image" });
  }
};

exports.addRoomImages = async (req, res) => {
  try {
    const { id: resortId, roomId } = req.params;
    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    const room = resort.roomTypes.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      newImages.forEach(img => {
        room.images.push(img);
      });
      await resort.save();
    }
    
    res.status(200).json({ success: true, message: "Room images added", resort });
  } catch (err) {
    console.error("Error adding room images:", err);
    res.status(500).json({ message: "Error adding room images" });
  }
};

exports.removeRoomImage = async (req, res) => {
  try {
    const { id: resortId, roomId } = req.params;
    const { imageUrl } = req.query;

    const resort = await Resort.findById(resortId);
    if (!resort) return res.status(404).json({ message: "Resort not found" });

    const room = resort.roomTypes.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (imageUrl && room.images) {
      room.images.pull(imageUrl);
      await resort.save();
      return res.status(200).json({ success: true, message: "Room image removed", resort });
    }

    res.status(200).json({ success: true, message: "No image removed", resort });
  } catch (err) {
    console.error("Error removing room image:", err);
    res.status(500).json({ message: "Error removing room image" });
  }
};

