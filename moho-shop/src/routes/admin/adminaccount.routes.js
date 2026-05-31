const express = require("express");
const router = express.Router();
const adminUserController = require("../../controllers/admin/adminaccount.controller");

// Tuyến đường thuần GET chỉ để đọc dữ liệu
router.get("/", adminUserController.index);

module.exports = router;
