const express = require("express");
const router = express.Router();

const checkoutController =
    require("../../controllers/client/checkout.controller");

router.get(
    "/",
    checkoutController.checkoutPage
);

router.get(
    "/buy-now/:id",
    checkoutController.buyNow
);

router.post(
    "/submit",
    checkoutController.submitOrder
);

module.exports = router;