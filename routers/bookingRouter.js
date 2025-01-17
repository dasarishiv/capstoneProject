const express = require("express");
const { protectRoute } = require("../controllers/authController");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bookingModel = require("../models/bookingModel");
const User = require("../models/userModel");

const bookingRouter = express.Router();
require("dotenv").config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

bookingRouter.post("/verify", async (req, res) => {
  try {
    console.log("web hook called");
    console.log(process.env.WEBHOOK_SECRET); // same secret key which we have used in razorpay dashboard
    const shasum = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const freshSignature = shasum.digest("hex");
    console.log("server based signature", freshSignature);
    console.log("reh headers", req.headers);
    if (freshSignature === req.headers["x-razorpay-signature"]) {
      console.log("request is legit");
      /** updating the status */
      const booking = await bookingModel.findOne({
        paymentOrderId: req.body.payload.payment.entity.order_id
      });
      booking.status = "confirmed";
      await booking.save();
      res.json({ status: "ok" });
    } else {
      res.status(401).json({ status: "invalid request" });
    }
  } catch (err) {
    console.log(err);
  }
});

bookingRouter.post("/:productId", protectRoute, async (req, res) => {
  try {
    console.log("calling booking router");
    const userId = req.userId;
    const productId = req.params.productId;
    const { priceAtBooking } = req.body;

    const bookingObj = {
      user: userId,
      product: productId,
      priceAtBooking
    };

    const booking = await bookingModel.create(bookingObj);

    console.log("booking created successfully:", booking);

    /** update user with booking details */
    const user = await User.findById(userId);
    user.bookings.push(booking._id);
    await user.updateOne({ _id: userId });

    /** creating order on razorpay */
    var options = {
      amount: priceAtBooking * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: booking._id.toString() // order id
    };
    const order = await instance.orders.create(options);
    console.log("order created at razorpay", order);
    booking.paymentOrderId = order.id;
    await booking.save();
    res.status(200).json({
      message: "Order created successfully",
      order: {
        ...order,
        orderKey: process.env.RAZORPAY_KEY_ID,
        companyName: "E-Cap"
      }
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

bookingRouter.get("/", protectRoute, async (req, res) => {
  try {
    const { userId } = req;

    const allBookings = await bookingModel
      .find()
      // .populate('user')
      // .populate('product');
      .populate({ path: "user", select: "name email" })
      .populate({ path: "product", select: "name price" })
      .sort({ bookedAt: -1 });
    res.status(200).json({
      message: "got all bookings",
      data: allBookings
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

bookingRouter.get("/user/:userId", protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const allBookings = await bookingModel
      // .find()
      .find({ user: userId })
      // .populate('user')
      // .populate('product');
      .populate({ path: "user", select: "name email" })
      .populate({ path: "product", select: "name price" })
      .sort({ bookedAt: -1 });
    res.status(200).json({
      message: "got all bookings",
      data: allBookings
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

bookingRouter.get("/:bookingId", protectRoute, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingdata = await bookingModel
      .findById(bookingId)
      .populate({ path: "user", select: "name email" })
      .populate({ path: "product", select: "name price" });

    res.status(200).json({
      message: "booking fetched successfully",
      data: bookingdata
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = bookingRouter;
