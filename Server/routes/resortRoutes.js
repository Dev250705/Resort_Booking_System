const express = require("express");
const router = express.Router();
const resortController = require("../controllers/resortController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// GET all resorts or Search resorts via Query Params
// Example search: /api/resorts?checkIn=...&checkOut=...&guests=4&rooms=2
router.get("/", resortController.searchResorts);

// GET a single resort detail by ID
router.get("/:id", resortController.getResortById);
// -- Admin Endpoints --
router.post("/admin", authMiddleware, adminMiddleware, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 15 }]), resortController.createResort);
router.put("/admin/:id", authMiddleware, adminMiddleware, resortController.updateResort);
router.delete("/admin/:id", authMiddleware, adminMiddleware, resortController.deleteResort);
router.post("/admin/:id/rooms", authMiddleware, adminMiddleware, upload.array('roomImages', 5), resortController.addRoomType);
router.put("/admin/:id/rooms/:roomId", authMiddleware, adminMiddleware, resortController.updateRoomType);
router.delete("/admin/:id/rooms/:roomId", authMiddleware, adminMiddleware, resortController.removeRoomType);
router.post("/admin/:id/images", authMiddleware, adminMiddleware, upload.array('newImages', 10), resortController.addResortImages);
router.delete("/admin/:id/images", authMiddleware, adminMiddleware, resortController.removeResortImage);

router.post("/admin/:id/rooms/:roomId/images", authMiddleware, adminMiddleware, upload.array('newImages', 10), resortController.addRoomImages);
router.delete("/admin/:id/rooms/:roomId/images", authMiddleware, adminMiddleware, resortController.removeRoomImage);

module.exports = router;