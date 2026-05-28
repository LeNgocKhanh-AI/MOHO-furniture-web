const express = require("express");
const path = require("path");
const session = require("express-session"); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static(path.join(__dirname, "src/public")));


/* ===== SESSION ===== */

app.use(
  session({
    secret: "moho_secret_key",
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* ===== SHARE SESSION ===== */

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


/* ROUTES */
const homeRoutes = require("./src/routes/client/home.routes");
const authRoutes = require("./src/routes/client/auth.routes");



app.use("/", homeRoutes);
app.use("/", authRoutes);

module.exports = app;