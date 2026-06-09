const productService = require("../../services/productadmin.service");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;

        const products = await productService.getProducts(page, limit);
        const categories = await productService.getCategories();

        const totalProducts = await productService.getTotalProducts();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render("admin/product", {
            products,
            categories,

            // 🔥 THÊM 2 DÒNG NÀY
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.log(error);
    }
};

// thêm sản phẩm

const create = async (req, res) => {
    try {
        const data = {
            ...req.body,
            is_featured: req.body.is_featured ? 1 : 0,
        };

        await productService.createProduct(data);

        res.redirect("/admin/dashboard/product");
    } catch (error) {
        console.log(error);
    }
};

// edit
const editForm = async (req, res) => {
    try {
        const id = req.params.id;

        const product = await productService.getProductById(id);
        const categories = await productService.getCategories();

        res.render("admin/product-edit", {
            product,
            categories,
        });
    } catch (error) {
        console.log(error);
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;

        const data = {
            ...req.body,
            is_featured: req.body.is_featured ? 1 : 0,
        };

        await productService.updateProduct(id, data);

        res.redirect("/admin/dashboard/product");
    } catch (error) {
        console.log(error);
    }
};

// xóa
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;

        await productService.deleteProduct(id);

        res.redirect("/admin/dashboard/product");
    } catch (error) {
        console.log(error);
    }
};



// Rồi thêm vào module.exports
module.exports = {
    index,
    create,
    editForm,
    update,
    deleteProduct,

};