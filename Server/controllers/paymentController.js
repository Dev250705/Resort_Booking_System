const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

let instance = null;
// Force mock mode bypassing env vars to ensure UPI UI displays without Razorpay restrictions
const razorpayKeyId = "";
const razorpayKeySecret = "";

// if (razorpayKeyId && razorpayKeySecret) {
//   instance = new Razorpay({
//     key_id: razorpayKeyId,
//     key_secret: razorpayKeySecret,
//   });
// }

exports.createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;
    const userId = req.user ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    // Mock fallback if keys missing
    if (!instance) {
      const mockOrderId = `order_MOCK_${Date.now()}`;
      await Payment.create({
        user: userId,
        booking: bookingId,
        razorpay_order_id: mockOrderId,
        amount: Number(amount),
        status: "Created",
      });
      return res.status(200).json({
        success: true,
        keyId: razorpayKeyId || "",
        order: { id: mockOrderId, amount: Math.round(Number(amount) * 100), currency: "INR" },
      });
    }

    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    });

    await Payment.create({
      user: userId,
      booking: bookingId,
      razorpay_order_id: order.id,
      amount: Number(amount),
      status: "Created",
    });

    res.status(200).json({
      success: true,
      keyId: razorpayKeyId,
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    const razorpayMessage =
      error?.error?.description ||
      error?.error?.reason ||
      error?.message ||
      "Failed to create razorpay order";
    res.status(500).json({ message: razorpayMessage });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const userId = req.user ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    // Mock verify
    if (razorpay_order_id && String(razorpay_order_id).startsWith("order_MOCK")) {
      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        { razorpay_payment_id, razorpay_signature, status: "Success" }
      );
      await Booking.findByIdAndUpdate(bookingId, {
        status: "Confirmed",
        $unset: { tempLockExpiresAt: 1 },
      });
      return res.status(200).json({ success: true, message: "Mock payment verified and booking confirmed" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Signature" });
    }

    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "Success",
      }
    );

    await Booking.findByIdAndUpdate(bookingId, {
      status: "Confirmed",
      $unset: { tempLockExpiresAt: 1 },
    });

    res.status(200).json({ success: true, message: "Payment verified and booking confirmed" });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: error?.message || "Payment Verification Failed" });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const payments = await Payment.find({ user: userId })
      .populate({
        path: "booking",
        populate: {
          path: "resort",
          select: "name location"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Fetch Payments Error:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
