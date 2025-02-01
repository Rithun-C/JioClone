
const express = require("express");
const PaymentRouter = express.Router();
const {
    getPaymentController,
    updatePremiumAccessController,
} = require("../controller/paymentController");

PaymentRouter.post("/order", getPaymentController);
PaymentRouter.patch("/update-premium-access", updatePremiumAccessController);

module.exports = PaymentRouter;