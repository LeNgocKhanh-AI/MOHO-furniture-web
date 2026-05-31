const categoryService = require("../../services/category.service");

// 1. Hiển thị danh sách danh mục (có phân trang)
const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        // Lấy danh sách category theo trang
        const categories = await categoryService.getCategories(page, limit);

        // Tính toán phân trang
        const totalCategories = await categoryService.getTotalCategories();
        const totalPages = Math.ceil(totalCategories / limit);

        res.render("admin/category", {
            categories,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
        res.status(500).send("Có lỗi xảy ra hệ thống!");
    }
};

// 2. Thêm mới danh mục
const create = async (req, res) => {
    try {
        const data = {
            cat_name: req.body.cat_name,
            cat_desc: req.body.cat_desc,
        };

        await categoryService.createCategory(data);

        // Sau khi thêm thành công, chuyển hướng về trang danh sách danh mục
        res.redirect("/admin/dashboard/category");
    } catch (error) {
        console.error("Lỗi khi tạo danh mục mới:", error);
        res.status(500).send("Có lỗi xảy ra hệ thống!");
    }
};

// 3. Hiển thị form chỉnh sửa danh mục
const editForm = async (req, res) => {
    try {
        const id = req.params.id;

        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).send("Không tìm thấy danh mục này!");
        }

        res.render("admin/category-edit", {
            category,
        });
    } catch (error) {
        console.error("Lỗi khi lấy form sửa danh mục:", error);
        res.status(500).send("Có lỗi xảy ra hệ thống!");
    }
};

// 4. Cập nhật danh mục
const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = {
            cat_name: req.body.cat_name,
            cat_desc: req.body.cat_desc,
        };

        await categoryService.updateCategory(id, data);

        res.redirect("/admin/dashboard/category");
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
        res.status(500).send("Có lỗi xảy ra hệ thống!");
    }
};

// 5. Xóa danh mục
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        await categoryService.deleteCategory(id);

        res.redirect("/admin/dashboard/category");
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        // Lưu ý: Ở đây có thể lỗi do ràng buộc khóa ngoại (nếu danh mục đang có sản phẩm)
        res
            .status(500)
            .send("Không thể xóa danh mục này (có thể do đang chứa sản phẩm)!");
    }
};

module.exports = {
    index,
    create,
    editForm,
    update,
    deleteCategory,
};
