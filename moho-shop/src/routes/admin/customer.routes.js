const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/admin/customer.controller");

router.get("/", customerController.index);
router.get("/delete/:id", customerController.deleteCustomer);

module.exports = router;
