// routes/api.js
const express = require("express");
const router = express.Router();
const PaymentController = require("../Controllers/PaymentController");

// Route to handle successful payments
router.post("/success", PaymentController.handlePaymentSuccess);
router.post("/create-order", PaymentController.createOrder);

module.exports = router;
