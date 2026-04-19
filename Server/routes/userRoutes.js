const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const OTP = require("../models/otp");
const { getJwtSecret } = require("../middleware/authMiddleware");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
      isVerified: false,
    });

    await newUser.save();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent" });
  } catch {
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = await OTP.findOne({ email, otp });

  if (!record) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  await User.updateOne({ email }, { isVerified: true });
  await OTP.deleteMany({ email });

  res.json({ message: "Verified successfully" });
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      to: email,
      subject: "Resend OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP resent" });
  } catch {
    res.status(500).json({ message: "Error resending OTP" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify OTP first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const secret = getJwtSecret();
    if (!secret) {
      return res.status(500).json({
        message: "Server misconfiguration: JWT_SECRET is not set",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      secret,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch {
    res.status(500).json({ message: "Error logging in" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password",
      html: `<a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>`,
    });

    res.json({ message: "Reset link sent" });
  } catch {
    res.status(500).json({ message: "Error sending email" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch {
    res.status(500).json({ message: "Error resetting password" });
  }
});

const { authMiddleware } = require("../middleware/authMiddleware");

// Update Profile route
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Update Password route
router.put("/update-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Error updating password" });
  }
});

// Get Profile route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Toggle Wishlist
router.post("/wishlist/toggle", authMiddleware, async (req, res) => {
  try {
    const { resortId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.wishlist.indexOf(resortId);
    if (index > -1) {
      user.wishlist.splice(index, 1); // remove
    } else {
      user.wishlist.push(resortId); // add
    }

    await user.save();
    res.json({ message: "Wishlist updated", wishlist: user.wishlist });
  } catch (err) {
    console.error("Error toggling wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Wishlist
router.get("/wishlist", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const { adminMiddleware } = require("../middleware/adminMiddleware");

// Admin: Get all users
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users for admin:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// Admin: Update user role
router.put("/admin/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ message: "Server error updating role" });
  }
});

module.exports = router;