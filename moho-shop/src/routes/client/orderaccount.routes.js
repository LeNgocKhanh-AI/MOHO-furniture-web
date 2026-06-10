const express = require("express");
const router = express.Router();
const orderAccountController = require("../../controllers/client/orderaccount.controller");

router.get("/", orderAccountController.getOrderAccountPage);
router.post("/confirm/:orderId", orderAccountController.confirmReceived);

module.exports = router;