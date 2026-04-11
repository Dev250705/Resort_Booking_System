const express = require("express");
const router = express.Router();
 const paymentController = require("../controllers/paymentController");

// fallback simple middleware if project authMiddleware structure is different
const authCheck = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  if (token.startsWith("Bearer ")) token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.post("/create-order", authCheck, paymentController.createOrder);
router.post("/verify-payment", authCheck, paymentController.verifyPayment);

module.exports = router;
