const express = require("express");
const router = express.Router();

const adviceController = require("../../controllers/client/advice.controller");

/* =========================
   PAGE
========================= */
router.get("/", adviceController.page);

/* =========================
   AI CHAT
========================= */
router.post("/chat", adviceController.chat);

module.exports = router;