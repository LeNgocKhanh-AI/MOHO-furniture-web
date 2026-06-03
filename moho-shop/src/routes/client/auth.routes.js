const express = require("express");

const router = express.Router();

const authController = require("../../controllers/client/authController");

/* ===== LOGIN ===== */
router.get("/login", (req, res) => {
  res.render("page/auth/login");
});
router.post("/login", authController.login);

/* ===== REGISTER ===== */

router.post("/register", authController.register);

/* ===== REGISTER PAGE ===== */

router.get("/register", (req, res) => {
  res.render("page/auth/register");
});

/* ===== LOGOUT ===== */

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
const passport = require("passport");

/* ===== GOOGLE AUTH ===== */

// 1. Khi user click vào nút đăng nhập Google (ở cả Header lẫn trang Login)
router.get(
  "/auth/google",
  (req, res, next) => {
    // Lấy link của trang hiện tại người dùng đang đứng và lưu vào Session của Server
    // Nếu không tìm thấy, mặc định sẽ là trang chủ '/'
    req.session.returnTo = req.header('Referer') || '/';
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// 2. Đường dẫn Callback nhận kết quả trả về từ Google
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Phân quyền Admin giữ nguyên logic của bạn
    if (req.user.role === "admin") {
      req.session.admin = req.user;
      return res.redirect("/admin/dashboard");
    }

    // Nếu là Customer (Khách mua hàng)
    req.session.customer = req.user;

    // Lấy link cũ đã lưu trong session ra, nếu không có thì mới về '/'
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo; // Xóa lưu trữ tạm trong session sau khi dùng xong

    // Redirect người dùng về lại đúng trang đặt hàng hoặc trang họ vừa đứng bấm nút
    return res.redirect(redirectUrl);
  }
);

module.exports = router;