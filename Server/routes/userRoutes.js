const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // check existing user
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
      role: "user", // ✅ added
    });

    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // ✅ role added
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // 🔒 secure
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ FORGOT PASSWORD
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

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Your Password 🔐",
      html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
      
      <h2 style="color:#333; text-align:center; margin-bottom:10px;">
        🔐 Reset Your Password
      </h2>

      <p style="font-size:15px; color:#555;">
        Hello <b>${user.name}</b>,
      </p>

      <p style="font-size:14px; color:#666;">
        We received a request to reset your password. Click the button below to continue.
      </p>

      <div style="text-align:center; margin:25px 0;">
        <a href="http://localhost:3000/reset-password?token=${token}" 
           style="background:#007bff; color:#fff; padding:12px 22px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
           Reset Password
        </a>
      </div>

      <p style="font-size:13px; color:#999; text-align:center;">
        This link will expire in <b>5 minutes</b>.
      </p>

      <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

      <p style="font-size:12px; color:#aaa; text-align:center;">
        If you didn’t request this, you can safely ignore this email.
      </p>

      <p style="font-size:12px; color:#aaa; text-align:center;">
        © 2026 Resort Booking System
      </p>

    </div>
  </div>
  `,
    });

    res.json({ message: "Reset link sent!" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email" });
  }
});

// ✅ RESET PASSWORD
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

    // 🔥 HASH PASSWORD (IMPORTANT FIX)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

module.exports = router;
