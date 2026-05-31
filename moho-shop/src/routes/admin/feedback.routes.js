const express = require("express");
const router = express.Router();
const feedbackController = require("../../controllers/admin/feedback.controller");

router.get("/", feedbackController.index);
// API ngầm dùng để cập nhật trạng thái sang 'read' khi admin nhấn xem
router.post("/mark-as-read/:id", feedbackController.markAsRead);
router.get("/delete/:id", feedbackController.deleteFeedback);

module.exports = router;
