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

module.exports = router;