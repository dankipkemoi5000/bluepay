require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "running",
    gateway: "BluePay"
  });
});

app.post("/stkpush", async (req, res) => {
  try {

    let { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount required"
      });
    }

    if (phone.startsWith("0")) {
      phone = "254" + phone.slice(1);
    }

    const response = await axios.post(
      "https://bluepay.co.ke/api/stk_push.php",
      {
        channel_id: process.env.CHANNEL_ID,
        phone,
        amount,
        account_reference: `BP-G4EE-REW4-${amount}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BLUEPAY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }
});

app.post("/payment-status", async (req, res) => {

  try {

    const { checkout_request_id } = req.body;

    const response = await axios.post(
      "https://bluepay.co.ke/api/payment_status.php",
      {
        checkout_request_id
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BLUEPAY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });

  }

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
