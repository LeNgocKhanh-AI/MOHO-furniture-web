const feedbackService = require("../../services/feedback.service");

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const feedbacks = await feedbackService.getFeedbacks(page, limit);
        const totalItems = await feedbackService.countFeedbacks();
        const totalPages = Math.ceil(totalItems / limit);

        res.render("admin/feedback", {
            feedbacks,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error at feedback index:", error);
        res.status(500).send("Lỗi tải trang feedback");
    }
};

// API trả về JSON phục vụ request ngầm từ client bấm nút xem
const markAsRead = async (req, res) => {
    try {
        await feedbackService.markAsRead(req.params.id);
        res.json({ success: true, message: "Đã đánh dấu xem thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        await feedbackService.deleteFeedback(req.params.id);
        res.redirect("/admin/dashboard/feedbacks");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa feedback");
    }
};

module.exports = { index, markAsRead, deleteFeedback };
