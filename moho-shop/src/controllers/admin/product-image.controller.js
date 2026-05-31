const imageService = require("../../services/product-image.service");
const db = require("../../config/db");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const images = await imageService.getImages(page, limit);
        const totalItems = await imageService.countImages();
        const totalPages = Math.ceil(totalItems / limit);

        // Lấy danh sách sản phẩm để người dùng chọn khi Thêm/Sửa ảnh
        const [products] = await db
            .promise()
            .query("SELECT product_id, product_name FROM product");

        res.render("admin/product-image", {
            images,
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at image index:", error);
        res.status(500).send("Lỗi tải trang hình ảnh sản phẩm");
    }
};

const create = async (req, res) => {
    try {
        await imageService.createImage(req.body);
        res.redirect("/admin/dashboard/product-images");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi thêm hình ảnh");
    }
};

const update = async (req, res) => {
    try {
        await imageService.updateImage(req.params.id, req.body);
        res.redirect("/admin/dashboard/product-images");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi cập nhật hình ảnh");
    }
};

const deleteImage = async (req, res) => {
    try {
        await imageService.deleteImage(req.params.id);
        res.redirect("/admin/dashboard/product-images");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa hình ảnh");
    }
};

module.exports = { index, create, update, deleteImage };
