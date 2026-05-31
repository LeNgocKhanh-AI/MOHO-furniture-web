const adminUserService = require("../../services/adminaccount.service");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Hiển thị 10 admin trên một trang

        const admins = await adminUserService.getAdmins(page, limit);
        const totalItems = await adminUserService.countAdmins();
        const totalPages = Math.ceil(totalItems / limit);

        res.render("admin/admin_users", {
            admins,
            currentPage: page,
            totalPages,
            activePage: "adminUsers", // Phục vụ việc sáng menu sidebar chính xác
        });
    } catch (error) {
        console.error("Error at admin users index:", error);
        res.status(500).send("Lỗi tải danh sách quản trị viên");
    }
};

module.exports = { index };
