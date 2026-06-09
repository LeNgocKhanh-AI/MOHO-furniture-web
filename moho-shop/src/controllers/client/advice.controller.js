const adviceService = require("../../services/advice.service");

// ─── RENDER PAGE ──────────────────────────────────────────────────────────────
exports.page = async (req, res) => {
    try {
        const products = await adviceService.getProducts();
        res.render("page/advice", { products, session: req.session });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

// ─── CHAT / IMAGE ANALYSIS ───────────────────────────────────────────────────
exports.chat = async (req, res) => {
    try {
        const { text, image, history } = req.body;
        if (!text && !image) {
            return res.status(400).json({ message: "Vui lòng nhập nội dung hoặc gửi ảnh." });
        }

        if (image) {
            if (!image.base64 || !image.mime) {
                return res.status(400).json({ message: "Dữ liệu ảnh không hợp lệ." });
            }
            const raw = await adviceService.callGeminiImage(text || "", image);
            return res.json({ mode: "image", raw });
        } else {
            const reply = await adviceService.callGeminiChat(text, history || []);
            return res.json({ mode: "chat", reply });
        }
    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({ message: err.message || "Lỗi AI, vui lòng thử lại." });
    }
};