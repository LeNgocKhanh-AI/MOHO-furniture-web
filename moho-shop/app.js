// const express = require("express");
// const path = require("path");
// const session = require("express-session");

// const passport =
//   require("./src/config/passport");

// const app = express();

// /* =========================
//    BODY PARSER
// ========================= */

// app.use(express.json());

// app.use(express.urlencoded({
//   extended: true
// }));

// /* =========================
//    VIEW ENGINE
// ========================= */

// app.set("view engine", "ejs");

// app.set(
//   "views",
//   path.join(__dirname, "src/views")
// );

// /* =========================
//    STATIC FILES
// ========================= */

// app.use(
//   express.static(
//     path.join(__dirname, "src/public")
//   )
// );

// /* =========================
//    SESSION
// ========================= */

// app.use(
//   session({

//     secret: "moho_secret_key",

//     resave: false,

//     saveUninitialized: false,

//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24,
//     },
//   })
// );

// /* =========================
//    PASSPORT
// ========================= */

// app.use(passport.initialize());

// /* =========================
//    SHARE SESSION TO EJS
// ========================= */

// app.use((req, res, next) => {

//   res.locals.session =
//     req.session;

//   next();
// });

// /* =========================
//    ROUTES
// ========================= */

// const homeRoutes =
//   require("./src/routes/client/home.routes");

// const authRoutes =
//   require("./src/routes/client/auth.routes");
// const cartRoutes =
//   require("./src/routes/client/cart.routes");

// app.use("/", homeRoutes);

// app.use("/", authRoutes);
// app.use("/cart", cartRoutes); // thêm


// /* =========================
//    EXPORT
// ========================= */

// module.exports = app;
const express = require("express");
const path = require("path");
const session = require("express-session");

const passport = require("./src/config/passport");

const app = express();

/* =========================
   BODY PARSER
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   VIEW ENGINE
========================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

/* =========================
   STATIC
========================= */
app.use(express.static(path.join(__dirname, "src/public")));

/* =========================
   SESSION + PASSPORT
========================= */
app.use(
  session({
    secret: "moho_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   SHARE SESSION
========================= */
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/* =========================
   CLIENT ROUTES
========================= */
const homeRoutes = require("./src/routes/client/home.routes");
const authRoutes = require("./src/routes/client/auth.routes");
const cartRoutes = require("./src/routes/client/cart.routes");

app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/cart", cartRoutes);

/* =========================
   ADMIN ROUTES (CLEAN)
========================= */



// import routes Dasboard
const dashboardRoute = require("./src/routes/admin/dashboard.routes");

// import routes product admin
const productRoutes = require("./src/routes/admin/product.routes");

// import routes category
const categoryRoutes = require("./src/routes/admin/category.routes");

// import routes productImage
const productImageRoutes = require("./src/routes/admin/product-image.routes");

// import routes product-review
const productReviewRoutes = require("./src/routes/admin/product-review.routes");

// import routes feedback
const feedbackRoutes = require("./src/routes/admin/feedback.routes");

const customerRoutes = require("./src/routes/admin/customer.routes");
// import routes order
const orderRoutes = require("./src/routes/admin/order.routes");

// import routes orderdetail
const orderDetailRoutes = require("./src/routes/admin/orderdetail.routes");

// import routes admin
const adminUserRoutes = require("./src/routes/admin/adminaccount.routes");

/* DASHBOARD */


// dùng routes dashboard
app.use("/admin", dashboardRoute);

// dùng routes admin/dashboard/product
app.use("/admin/dashboard", productRoutes);

// routes admin/dashboard/product/create
app.use("/admin/dashboard/product", productRoutes);

// routes category
app.use("/admin/dashboard", categoryRoutes);

// routes category
app.use("/admin/dashboard/category", categoryRoutes);

// routes productImage
app.use("/admin/dashboard", productImageRoutes);

// routes productImage
app.use("/admin/dashboard/product-images", productImageRoutes);

// routest product-review
app.use("/admin/dashboard", productReviewRoutes);

// routest product-review
app.use("/admin/dashboard/product-reviews", productReviewRoutes);

// routest feedback
app.use("/admin/dashboard", feedbackRoutes);

// routest feedback
app.use("/admin/dashboard/feedbacks", feedbackRoutes);

app.use("/admin/dashboard", customerRoutes);

app.use("/admin/dashboard/customers", customerRoutes);

// routest order
app.use("/admin/dashboard", orderRoutes);

// routest order
app.use("/admin/dashboard/orders", orderRoutes);

// routest orderdetail
app.use("/admin/dashboard", orderDetailRoutes);

// routest orderdetail
app.use("/admin/dashboard/order-details", orderDetailRoutes);

// routest admin
app.use("/admin/dashboard", adminUserRoutes);

// routest admin
app.use("/admin/dashboard/admin-users", adminUserRoutes);

module.exports = app;