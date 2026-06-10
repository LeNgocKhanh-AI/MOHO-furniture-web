const cartService = require("../../services/adminaccount.service");
const db = require("../../config/db");

exports.getAccountPage = (req, res) => {
    // Sửa dòng này: Lấy customer_id từ bên trong object req.session.customer
    const customerId = req.session.customer
        ? req.session.customer.customer_id
        : null;

    console.log("ID đang tìm kiếm:", customerId); // Kiểm tra lại Terminal xem nó in ra gì

    if (!customerId) {
        console.log("Lỗi: Không tìm thấy ID trong session");
        return res.redirect("/login");
    }

    const sql =
        "SELECT customer_firstname, customer_lastname, customer_email, customer_phone FROM customer WHERE customer_id = ?";

    db.query(sql, [customerId], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn DB:", err);
            return res.status(500).send("Lỗi hệ thống database");
        }

        if (results.length === 0) {
            console.log("Không tìm thấy user với ID trong DB:", customerId);
            return res.status(404).send("Người dùng không tồn tại trong CSDL");
        }

        res.render("page/account", { user: results[0] });
    });
};

exports.updateAccount = (req, res) => {
    console.log("Dữ liệu nhận từ form:", req.body); // Thêm dòng này để debug

    const { firstname, lastname, phone } = req.body;
    const customerId = req.session.customer
        ? req.session.customer.customer_id
        : null;

    if (!customerId) return res.redirect("/login");

    const sql =
        "UPDATE customer SET customer_firstname = ?, customer_lastname = ?, customer_phone = ? WHERE customer_id = ?";

    db.query(sql, [firstname, lastname, phone, customerId], (err, result) => {
        if (err) {
            console.error("Lỗi update:", err);
            return res.status(500).send("Lỗi cập nhật!");
        }

        // Cập nhật thành công: Cần đồng bộ lại Session nếu bạn có lưu tên trong đó
        if (req.session.customer) {
            req.session.customer.customer_firstname = firstname;
        }

        res.redirect("/account"); // Load lại trang sau khi update
    });
};