const express = require("express");
const router = express.Router();
const exploreController = require("../controllers/exploreController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public Endpoint
router.get("/", exploreController.getContentByType);

// Admin Endpoints
router.post("/admin", authMiddleware, adminMiddleware, upload.single("image"), exploreController.createContent);
router.delete("/admin/:id", authMiddleware, adminMiddleware, exploreController.deleteContent);

module.exports = router;
