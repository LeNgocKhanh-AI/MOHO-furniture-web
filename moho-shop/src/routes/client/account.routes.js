const express = require("express");
const router = express.Router();
const accountController = require("../../controllers/client/account.controller");

// Trang hiển thị thông tin
router.get("/", accountController.getAccountPage);

// Trang xử lý cập nhật
router.post("/update", accountController.updateAccount);

module.exports = router;