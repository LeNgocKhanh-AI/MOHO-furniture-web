const db = require("../config/db");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Danh sách model fallback: thử lần lượt khi quá tải
const GEMINI_MODELS = [
    "gemini-2.5-flash",
];

// Tách JSON ra khỏi text thừa (AI hay thêm text trước/sau JSON)
function extractJSON(raw) {
    if (!raw) return null;
    let text = raw.replace(/```json|```/g, '').trim();
    // Tìm { đầu tiên và } cuối cùng
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
        return JSON.parse(text.slice(start, end + 1));
    } catch {
        return null;
    }
}

// Gọi Gemini với fallback model và retry
async function callGemini(requestBodyFn) {
    const attempts = 2; // Số lần retry mỗi model
    for (const model of GEMINI_MODELS) {
        let delay = 1000;
        for (let i = 0; i < attempts; i++) {
            try {
                console.log(`[Gemini] Trying ${model} (attempt ${i + 1})...`);
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBodyFn(model))
                    }
                );
                const data = await res.json();
                if (res.ok && !data.error) {
                    console.log(`[Gemini] Success with ${model}`);
                    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                }
                const errMsg = data.error?.message || `HTTP ${res.status}`;
                console.warn(`[Gemini] ${model} attempt ${i + 1} failed: ${errMsg}`);
                // Lỗi 404 (model không tồn tại) → chuyển sang model tiếp
                if (res.status === 404) break;
                // Lỗi 429/503 (quá tải) → retry sau delay
                if (i < attempts - 1) {
                    await new Promise(r => setTimeout(r, delay));
                    delay *= 2;
                }
            } catch (err) {
                console.warn(`[Gemini] ${model} attempt ${i + 1} error: ${err.message}`);
                if (i < attempts - 1) {
                    await new Promise(r => setTimeout(r, delay));
                    delay *= 2;
                }
            }
        }
        console.log(`[Gemini] Switching to next model...`);
    }
    throw new Error("Tất cả model AI đều quá tải. Vui lòng thử lại sau ít phút!");
}

exports.extractJSON = extractJSON;
exports.getProducts = async () => {
    const [rows] = await db.promise().query(`
        SELECT p.*, pi.image_url, c.cat_name AS category,
            ROUND(AVG(pr.rating), 1) AS avg_rating,
            COALESCE(SUM(od.quantity), 0) AS total_sold
        FROM product p
        LEFT JOIN product_image pi ON pi.product_id = p.product_id AND pi.image_type = 'main'
        LEFT JOIN category c ON c.cat_id = p.category_id
        LEFT JOIN product_review pr ON pr.product_id = p.product_id
        LEFT JOIN order_detail od ON od.product_id = p.product_id
        GROUP BY p.product_id, pi.image_url, c.cat_name
    `);
    return rows;
};

// ─── TEXT CHAT — Tư vấn thiết kế nội thất chuyên sâu ─────────────────────────
exports.callGeminiChat = async (text, history = []) => {
    const products = await exports.getProducts();

    // Phân loại sản phẩm theo category
    const byCategory = {};
    for (const p of products) {
        const cat = (p.category || "Khác").trim();
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push({
            id: p.product_id,
            name: p.product_name,
            price: p.product_sale_price,
            img: p.image_url,
            rating: p.avg_rating,
            sold: p.total_sold
        });
    }

    // Mỗi category giữ tối đa 15 sản phẩm (ưu tiên rating cao + bán chạy)
    const categorySummary = Object.entries(byCategory).map(([cat, items]) => ({
        category: cat,
        total: items.length,
        products: items
            .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.sold || 0) - (a.sold || 0))
            .slice(0, 15)
    }));

    const systemPrompt = `Bạn là chuyên gia tư vấn thiết kế nội thất cao cấp của MOHO Việt Nam — thương hiệu nội thất hiện đại, thân thiện với môi trường.

## VAI TRÒ:
- Bạn am hiểu sâu các phong cách thiết kế: Scandinavian (Bắc Âu), Japandi (Nhật Bản phối hợp Bắc Âu), Industrial (Công nghiệp), Mid-century Modern, Minimalist (Tối giản), Classic (Cổ điển), Coastal (Đại dương), Bohemian
- Bạn biết nguyên tắc phối màu (Color Theory), bố trí không gian (Space Planning), chiếu sáng (Lighting Design)
- Bạn hiểu về phong thủy cơ bản cho người Việt (hướng giường, hướng gương, màu sắc theo mệnh)
- Bạn tư vấn dựa trên sản phẩm thật của MOHO

## DANH MỤC SẢN PHẨM THỰC TẾ (phân theo nhóm, ưu tiên rating cao):
${JSON.stringify(categorySummary)}

## NGUYÊN TẮC TƯ VẤN:
1. Đọc kỹ yêu cầu → xác định: loại phòng, diện tích, phong cách, budget, nhu cầu đặc biệt
2. Nếu có budget → chỉ gợi ý sản phẩm trong tầm giá (±20%)
3. Nếu không rõ budget → gợi ý các mức giá khác nhau
4. Chọn sản phẩm đúng category phù hợp câu hỏi (ví dụ hỏi phòng ngủ thì chọn Giường, Tủ đầu giường...)
5. Mỗi sản phẩm PHẢI có lý do cụ thể: tại sao phù hợp với phòng/phong cách/diện tích
6. Gợi ý theo SET/COMBO khi có thể (sofa + bàn cà phê + kệ TV) để phòng có độ đồng bộ cao
7. Nếu câu hỏi mơ hồ → hỏi thêm thông tin trong câu trả lời (như diện tích, hướng cửa) để tư vấn chính xác hơn nhưng vẫn phải đưa ra gợi ý trước
8. Trả lời tự nhiên, thân thiện, dùng emoji hợp lý
9. Khi tư vấn phong cách → giải thích đặc điểm chính của phong cách đó

## CÁCH TRẢ LỜI:
- Dùng **in đậm** cho tên sản phẩm và điểm quan trọng
- Dùng xuống dòng để tách ý rõ ràng
- Cấu trúc rõ ràng: phân tích yêu cầu → gợi ý → lý do → tổng kết

## ĐỊNH DẠNG BẮT BUỘC — JSON thuần, KHÔNG markdown code block:
{
  "reply": "câu trả lời tư vấn thiết kế chi tiết bằng tiếng Việt, dùng **bold** cho điểm quan trọng, xuống dòng bằng \\n",
  "has_products": true hoặc false,
  "products": [
    {
      "product_id": "id thật từ danh sách trên",
      "name": "tên sản phẩm",
      "reason": "lý do phù hợp CỤ THỂ (diện tích/phong cách/giá/combo)",
      "price_estimate": 0
    }
  ]
}
- Nếu has_products true → gợi ý 3-6 sản phẩm, ưu tiên id thật
- Nếu has_products false → products: []
- Chỉ trả JSON thuần, không bọc markdown`;

    const messages = [];
    for (const h of history) {
        messages.push({ role: h.role, parts: [{ text: h.text }] });
    }
    messages.push({ role: "user", parts: [{ text }] });

    return await callGemini(() => ({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
    }));
};

// ─── PHÂN TÍCH ẢNH PHÒNG + GỢI Ý SẢN PHẨM (không edit ảnh) ──────────────────
exports.callGeminiImage = async (text, image) => {
    const products = await exports.getProducts();
    const sample = products.slice(0, 20).map(p => ({
        id: p.product_id,
        name: p.product_name,
        price: p.product_sale_price,
        cat: (p.category || "").substring(0, 20)  // bỏ img/rating/sold để giảm token
    }));

    const prompt = `Bạn là chuyên gia tư vấn thiết kế nội thất MOHO Việt Nam.
Sản phẩm có sẵn: ${JSON.stringify(sample)}
${text ? `Yêu cầu khách: "${text}"` : ""}

Phân tích ảnh phòng, trả JSON thuần (KHÔNG markdown):
{
  "advice": "tư vấn 2-3 câu ngắn gọn",
  "analysis": {
    "room_type": "loại phòng",
    "area": "diện tích ước tính",
    "style": "phong cách phù hợp",
    "strengths": "điểm mạnh",
    "missing": "cần bổ sung",
    "color_palette": "2-3 màu chủ đạo",
    "layout_tips": "gợi ý bố trí"
  },
  "products": [
    { "product_id": "id từ danh sách", "name": "tên", "reason": "lý do ngắn", "price_estimate": 0, "placement": "vị trí đặt" }
  ]
}
Gợi ý 3-4 sản phẩm. Chỉ JSON thuần.`;

    return await callGemini(() => ({
        contents: [{
            role: "user",
            parts: [
                { inline_data: { mime_type: image.mime, data: image.base64 } },
                { text: prompt }
            ]
        }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 4096 }
    }));
};