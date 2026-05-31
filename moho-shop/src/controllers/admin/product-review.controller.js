const reviewService = require("../../services/product-review.service");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const reviews = await reviewService.getReviews(page, limit);
        const totalItems = await reviewService.countReviews();
        const totalPages = Math.ceil(totalItems / limit);

        res.render("admin/product-review", {
            reviews,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at review index:", error);
        res.status(500).send("Lỗi tải trang đánh giá sản phẩm");
    }
};

const deleteReview = async (req, res) => {
    try {
        await reviewService.deleteReview(req.params.id);
        res.redirect("/admin/dashboard/product-reviews");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa đánh giá");
    }
};

module.exports = { index, deleteReview };
