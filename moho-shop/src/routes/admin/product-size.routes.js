const express = require("express");
const router = express.Router();
const sizeController = require("../../controllers/admin/product-size.controller");

router.get("/", sizeController.index);
router.post("/create", sizeController.create);
router.post("/edit/:id", sizeController.update);
router.get("/delete/:id", sizeController.deleteSize);

module.exports = router;