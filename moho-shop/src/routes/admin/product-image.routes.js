const express = require("express");
const router = express.Router();
const imageController = require("../../controllers/admin/product-image.controller");

router.get("/", imageController.index);
router.post("/create", imageController.create);
router.post("/edit/:id", imageController.update);
router.get("/delete/:id", imageController.deleteImage);

module.exports = router;
