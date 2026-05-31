const express = require("express");

const router = express.Router();

const authController = require("../../controllers/client/authController");

/* ===== LOGIN ===== */

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

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {

    if (req.user.role === "admin") {

      req.session.admin = req.user;

      return res.redirect("/admin/dashboard");
    }

    req.session.customer = req.user;

    return res.redirect("/");
  }
);

module.exports = router;