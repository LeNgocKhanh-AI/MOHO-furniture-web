const orderDetailService = require("../../services/orderdetail.service");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Hiển thị 10 dòng chi tiết đơn hàng trên một trang

        const orderDetails = await orderDetailService.getOrderDetails(page, limit);
        const totalItems = await orderDetailService.countOrderDetails();
        const totalPages = Math.ceil(totalItems / limit);

        res.render("admin/orderdetail", {
            orderDetails,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at order detail index:", error);
        res.status(500).send("Lỗi tải trang chi tiết đơn hàng");
    }
};

module.exports = { index };
