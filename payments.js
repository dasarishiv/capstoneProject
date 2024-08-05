const cors = require("cors");
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto"); // node based package

require("dotenv").config();
const shortid = require("shortid");

const app = express();
app.use(cors());
app.use(express.json());
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

// const options = {
//   amount: 50000, // amount in the smallest currency unit
//   currency: "INR",
//   receipt: shortid.generate()
// };
// instance.orders.create(options, function (err, order) {
//   console.log(order);
// });

app.post("/checkout", (req, res) => {
  // the details below in a real world app will be fetched
  //via an internal order id
  // when the user finalized their cart, an order id will
  //be generated and passed to this route
  const options = {
    amount: 50000, // amount in the smallest currencyunit
    currency: "INR",
    receipt: shortid.generate()
  };
  instance.orders.create(options, function (err, order) {
    // console.log(order);
    res.status(201).json({
      message: "order created successfully",
      order: order,
      status: "success"
    });
  });
});

app.post("/verify", (req, res) => {
  try {
    // console.log("web hook called");
    // console.log(process.env.WEBHOOK_SECRET); // same secret key which we have used in razorpay dashboard
    const shasum = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const freshSignature = shasum.digest("hex");
    // console.log("server based signature", freshSignature);
    // console.log("reh headers", req.headers);
    if (freshSignature === req.headers["x-razorpay-signature"]) {
      // console.log("request is legit");
      res.json({ status: "ok" });
    } else {
      res.status(401).json({ status: "invalid request" });
    }
  } catch (err) {
    console.log(err);
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
