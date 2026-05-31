const express = require("express");
const router = express.Router();

const cartController =
    require("../../controllers/client/cartController");

router.get("/", cartController.cartPage);

router.get("/item", cartController.getCart);

router.post("/add", cartController.addToCart);

router.post("/update", cartController.updateQuantity);

router.post("/remove", cartController.removeItem);

module.exports = router;