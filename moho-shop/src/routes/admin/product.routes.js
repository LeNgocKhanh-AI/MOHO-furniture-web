const express = require("express");

const router = express.Router();

const productController = require("../../controllers/admin/product.controller");

router.get("/", productController.index);

router.post("/create", productController.create);

// form sửa
router.get("/edit/:id", productController.editForm);

// xử lý cập nhật
router.post("/edit/:id", productController.update);

// xóa
router.get("/delete/:id", productController.deleteProduct);



module.exports = router;
