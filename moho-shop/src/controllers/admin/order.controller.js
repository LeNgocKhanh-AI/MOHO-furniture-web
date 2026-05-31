const orderService = require("../../services/order.service");
const db = require("../../config/db");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Hiển thị 5 dòng mỗi trang đơn hàng

        const orders = await orderService.getOrders(page, limit);
        const totalItems = await orderService.countOrders();
        const totalPages = Math.ceil(totalItems / limit);

        res.render("admin/orders", {
            orders,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at order index:", error);
        res.status(500).send("Lỗi tải trang danh sách đơn hàng");
    }
};

// Lấy danh sách sản phẩm trong đơn hàng phục vụ Form Popup
// 🔥 HÀM API ĐÃ ĐƯỢC CẬP NHẬT CHUẨN THEO DATABASE CỦA BẠN
const getItemsApi = async (req, res) => {
    try {
        const orderId = req.query.order_id;
        if (!orderId) {
            return res.status(400).json({ error: "Thiếu mã đơn hàng" });
        }

        // Câu lệnh SQL chuẩn:
        // - Lấy chính xác cột `unit_price` và `quantity` từ bảng `order_detail` (od)
        // - Liên kết sang bảng `product` (p) để lấy tên, sku, mô tả
        // - Liên kết an toàn sang bảng `product_image` (pi) để lấy ảnh đại diện
        const query = `
      SELECT 
        od.order_id,
        od.product_id,
        od.quantity,
        od.unit_price,
        p.product_name, 
        p.product_sku,
        p.product_description,
        (
          SELECT pi.image_url 
          FROM product_image pi 
          WHERE pi.product_id = p.product_id 
          LIMIT 1
        ) AS product_image
      FROM order_detail od
      LEFT JOIN product p ON od.product_id = p.product_id
      WHERE od.order_id = ?
    `;

        const [rows] = await db.promise().query(query, [orderId]);

        // Trả dữ liệu JSON sạch về cho Frontend xử lý công khai
        return res.json(rows);
    } catch (error) {
        // Dòng này cực kỳ quan trọng, nếu vẫn lỗi nó sẽ in thẳng lỗi SQL ra Terminal (VS Code) cho bạn nhìn
        console.error("❌ LỖI TRUY VẤN DATABASE CHI TIẾT:", error);
        return res
            .status(500)
            .json({ error: "Lỗi máy chủ nội bộ không thể lấy dữ liệu sản phẩm" });
    }
};
module.exports = { index, getItemsApi };
