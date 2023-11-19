const Payment = require("../Models/PaymentModel");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

const handlePaymentSuccess = async (req, res) => {
  try {
    console.log(req.body);
    const { orderId, amount, paymentId, signature, recipientEmail } = req.body;

    // Sample values (replace these with actual values from Razorpay webhook)
    const razorpay_payment_id = "sample_payment_id";
    const razorpay_order_id = "sample_order_id";
    const razorpay_signature = "sample_signature";

    if (!orderId || !amount || !paymentId || !signature || !recipientEmail) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Perform signature verification (replace 'your_razorpay_webhook_secret' with your actual webhook secret)
    const generatedSignature = razorpay.webhooks.generateSignature(
      req.rawBody,
      "your_razorpay_webhook_secret"
    );

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Process successful payment and send email confirmation, etc.
    // You can add your business logic here.

    res.json({ success: true });
  } catch (error) {
    console.error("Payment processing error: " + error);
    return res.status(500).json({ error: "Payment processing failed" });
  }
};

const createOrder = async (req, res) => {
  try {
    const recipientEmail = req.body.recipientEmail;

    // Save the recipient's email to the database
    const payment = new Payment({
      recipientEmail,
      timestamp: new Date(),
    });

    await payment.save();

    // Use the Razorpay package to create an order
    const razorpay = new Razorpay({
      key_id: "rzp_test_nlbvgLgyo99Uom",
      key_secret: "CdJ75QZkenKvGkdeqNlcECVP",
    });

    // Replace this with the actual order details
    const orderData = {
      amount: 1000, // Amount in paisa (e.g., 1000 for 10 INR)
      currency: "INR",
      receipt: "order123",
    };

    razorpay.orders.create(orderData, async function (err, order) {
      if (err) {
        console.error("Error creating Razorpay order: " + err);
        return res.status(500).json({ error: "Failed to create an order" });
      }

      // Send a confirmation email to the recipient
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "arunramasamy46@gmail.com",
          pass: "pruxtxnekznczdpc",
        },
      });

      const mailOptions = {
        from: "arunramasamy46@gmail.com",
        to: recipientEmail,
        subject: "Order Confirmation from Comfort Path",
        html: `
    <h1>Dear Customer,</h1>
    <p>Thank you for choosing Comfort Path! Your order has been successfully created.</p>
       <p>Your items will be ready to ship</p>
    <p>For any questions or concerns, please contact our customer support.</p>
    <p>Thank you for shopping with Comfort Path!</p>
  `,
      };

      transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          console.log("Email error: " + emailError);
          return res.status(500).json({ error: "Email sending failed" });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json(order);
        }
      });
    });
  } catch (error) {
    console.error("Order creation error: " + error);
    return res.status(500).json({ error: "Order creation failed" });
  }
};

module.exports = { handlePaymentSuccess, createOrder };
