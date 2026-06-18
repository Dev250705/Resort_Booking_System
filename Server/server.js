const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;

dotenv.config();
connectDB();

const jwtSecretConfigured = Boolean(
  String(process.env.JWT_SECRET || "").trim(),
);
if (!jwtSecretConfigured) {
  console.error(
    "[auth] JWT_SECRET is empty — login and payments will fail until you set JWT_SECRET in Server/.env",
  );
}

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpaySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
const maskedKeyId = razorpayKeyId
  ? `${razorpayKeyId.slice(0, 12)}...${razorpayKeyId.slice(-4)}`
  : "missing";
console.log(
  `[Razorpay Config] keyId=${maskedKeyId}, secretLoaded=${razorpaySecret ? "yes" : "no"}`,
);

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://resort-booking-system-five.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const userRoutes = require("./routes/userRoutes");

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/users", userRoutes);
const resortRoutes = require("./routes/resortRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/resorts", resortRoutes);
app.use("/api/bookings", bookingRoutes);
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

const exploreRoutes = require("./routes/exploreRoutes");
app.use("/api/explore", exploreRoutes);
const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
