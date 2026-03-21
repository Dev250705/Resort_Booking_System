const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const newUser = new User({
      name,
      email,
      password,
      phone
    });

    await newUser.save();

    res.json({
      message: "User registered successfully",
      user: newUser
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message
    });
  }
});

module.exports = router;