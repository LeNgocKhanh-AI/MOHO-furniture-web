const customerService = require("../../services/customer.service");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const customers = await customerService.getCustomers(page, limit);
        const totalItems = await customerService.countCustomers();
        const totalPages = Math.ceil(totalItems / limit);

        res.render("admin/customer", {
            customers,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at customer index:", error);
        res.status(500).send("Lỗi tải trang quản lý khách hàng");
    }
};

const deleteCustomer = async (req, res) => {
    try {
        await customerService.deleteCustomer(req.params.id);
        res.redirect("/admin/dashboard/customers");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa khách hàng");
    }
};

module.exports = { index, deleteCustomer };
