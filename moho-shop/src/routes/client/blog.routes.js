const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/client/blog.controller");

// LƯU Ý: Vì lát nữa ở app.js ta sẽ bắt đầu bằng tiền tố "/news",
// nên ở đây ta chỉ cần viết phần đuôi phía sau thôi.

// Đường dẫn thực tế sẽ là: /news/:category_slug
router.get("/:category_slug", blogController.index);

// Đường dẫn thực tế sẽ là: /news/:category_slug/:post_slug
router.get("/:category_slug/:post_slug", blogController.detail);

module.exports = router;
