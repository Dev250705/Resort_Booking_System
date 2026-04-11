const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpaySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
const maskedKeyId = razorpayKeyId
  ? `${razorpayKeyId.slice(0, 12)}...${razorpayKeyId.slice(-4)}`
  : "missing";
console.log(
  `[Razorpay Config] keyId=${maskedKeyId}, secretLoaded=${razorpaySecret ? "yes" : "no"}`
);

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});