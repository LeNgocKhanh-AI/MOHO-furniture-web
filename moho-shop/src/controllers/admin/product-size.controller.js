const sizeService = require("../../services/product-size.service");
const db = require("../../config/db");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const sizes = await sizeService.getSizes(page, limit);
        const totalItems = await sizeService.countSizes();
        const totalPages = Math.ceil(totalItems / limit);

        // Lấy danh sách sản phẩm để dùng trong form thêm/sửa
        const [products] = await db
            .promise()
            .query("SELECT product_id, product_name, product_price FROM product ORDER BY product_name ASC");

        res.render("admin/product-size", {
            sizes,
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at size index:", error);
        res.status(500).send("Lỗi tải trang kích thước sản phẩm");
    }
};

const create = async (req, res) => {
    try {
        await sizeService.createSize(req.body);
        res.redirect("/admin/dashboard/product-sizes");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi thêm kích thước");
    }
};

const update = async (req, res) => {
    try {
        await sizeService.updateSize(req.params.id, req.body);
        res.redirect("/admin/dashboard/product-sizes");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi cập nhật kích thước");
    }
};

const deleteSize = async (req, res) => {
    try {
        await sizeService.deleteSize(req.params.id);
        res.redirect("/admin/dashboard/product-sizes");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa kích thước");
    }
};

module.exports = { index, create, update, deleteSize };