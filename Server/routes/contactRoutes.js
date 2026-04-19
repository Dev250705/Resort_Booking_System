const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

router.post("/", contactController.submitContactForm);
router.get("/admin", authMiddleware, adminMiddleware, contactController.getContacts);
router.put("/admin/:id", authMiddleware, adminMiddleware, contactController.updateContactStatus);

module.exports = router;
