const bcrypt = require("bcrypt");

const authModel = require("../../services/auth");

/* ===== REGISTER ===== */

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, gender, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    authModel.register(
      {
        firstname,
        lastname,
        gender,
        email,
        password: hashedPassword,
      },

      (err, result) => {
        if (err) {
          return res.json({
            success: false,
            message: "Email đã tồn tại",
          });
        }

        res.json({
          success: true,
          message: "Đăng ký thành công",
        });
      }
    );
  } catch (error) {
    res.json({
      success: false,
      message: "Có lỗi xảy ra",
    });
  }
};

/* ===== LOGIN ===== */

exports.login = (req, res) => {
  const { email, password } = req.body;

  /* ===== ADMIN ===== */

  authModel.loginAdmin(email, async (err, adminResult) => {
    if (adminResult.length > 0) {
      const admin = adminResult[0];

      const match = await bcrypt.compare(
        password,
        admin.admin_password
      );

      if (match) {
        req.session.admin = {
          admin_id: admin.admin_id,
          admin_email: admin.admin_email,
        };

        return res.json({
          success: true,
          role: "admin",
          redirect: "/admin/dashboard",
        });
      }
    }

    /* ===== CUSTOMER ===== */

    authModel.loginCustomer(
      email,

      async (err, customerResult) => {
        if (customerResult.length === 0) {
          return res.json({
            success: false,
            message: "Sai email hoặc mật khẩu",
          });
        }

        const customer = customerResult[0];

        const match = await bcrypt.compare(
          password,
          customer.customer_password
        );

        if (!match) {
          return res.json({
            success: false,
            message: "Sai email hoặc mật khẩu",
          });
        }

        req.session.customer = {
          customer_id: customer.customer_id,

          customer_email: customer.customer_email,

          customer_firstname:
            customer.customer_firstname,
        };

        res.json({
          success: true,
          role: "customer",
        });
      }
    );
  });
};