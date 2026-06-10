const express = require("express");
const path = require("path");
const session = require("express-session");

const passport = require("./src/config/passport");

const app = express();

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
   }),
);

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   SHARE & ĐỒNG BỘ SESSION (ĐÃ SỬA)
========================= */
app.use((req, res, next) => {
   // Đồng bộ dữ liệu từ Passport (req.user) sang Session tùy biến của dự án
   if (req.user) {
      if (req.user.role === "admin") {
         req.session.admin = req.user;
      } else if (req.user.role === "customer") {
         req.session.customer = req.user;
      }
   }

   res.locals.session = req.session;
   res.locals.user = req.user || null; // Giúp các file EJS hiển thị được avatar/tên user công khai
   next();
});

/* =========================
   CLIENT ROUTES
========================= */
const homeRoutes = require("./src/routes/client/home.routes");
const authRoutes = require("./src/routes/client/auth.routes");
const cartRoutes = require("./src/routes/client/cart.routes");
const adviceRoutes = require("./src/routes/client/advice.routes");
const accountRoutes = require("./src/routes/client/account.routes");
const orderAccountRoutes = require("./src/routes/client/orderaccount.routes");

app.use("/advice", adviceRoutes);
app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/cart", cartRoutes);
app.use("/account", accountRoutes);
app.use("/orderaccount", orderAccountRoutes);

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

const blogRoutes = require("./src/routes/client/blog.routes");

const postAdminRoutes = require("./src/routes/admin/post.routes");

const checkoutRoutes = require("./src/routes/client/checkout.routes");

const paymentRoutes = require("./src/routes/client/payment.routes");

const productSizeRoutes = require("./src/routes/admin/product-size.routes");



/* DASHBOARD MIDDLEWARES */

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

app.use("/news", blogRoutes);

// routest admin
app.use("/admin/dashboard", postAdminRoutes);

app.use("/admin/dashboard/posts", postAdminRoutes);

app.use("/admin/dashboard/product-sizes", productSizeRoutes);
/* =========================
   CHECKOUT & PAYMENT ROUTES (ĐÃ SỬA)
========================= */
app.use("/checkout", checkoutRoutes);
app.use("/", paymentRoutes); // Đảm bảo xử lý đúng gốc /checkout/bank-transfer
app.use("/payment", paymentRoutes);

module.exports = app;