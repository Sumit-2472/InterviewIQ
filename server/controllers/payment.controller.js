import razorpay from "../services/razorpay.service.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";
import User from "../models/user.model.js";
export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;
    if (!amount || !credits) {
      return res.status(400).json({ message: "Invalid plan data" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json(order);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `failed to create Razorpay order ${err}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    // ✅ 1. Check if API is called
    console.log("===== VERIFY PAYMENT API CALLED =====");

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // ✅ 2. Check what Razorpay sent
    console.log("Request Body:", req.body);

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ✅ 3. Compare signatures
    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Signature verification failed");
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ 4. Check if payment exists
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    console.log("Payment Document:", payment);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      console.log("Payment already processed");
      return res.json({ message: "Already processed" });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    console.log("Payment saved successfully");

    // ✅ 5. Before updating user
    console.log("User ID:", payment.userId);
    console.log("Credits to Add:", payment.credits);

    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        $inc: { credits: payment.credits },
      },
      { new: true }
    );

    // ✅ 6. Check updated user
    console.log("Updated User:", updatedUser);

    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      message: `Failed to verify Razorpay payment: ${error.message}`,
    });
  }
};