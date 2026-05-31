const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/admin/product-review.controller");

router.get("/", reviewController.index);
router.get("/delete/:id", reviewController.deleteReview);

module.exports = router;
