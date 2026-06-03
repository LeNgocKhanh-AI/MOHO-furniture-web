const postService = require("../../services/post.service");
const db = require("../../config/db"); // Import thêm db để gọi nhanh danh mục blog

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const posts = await postService.getPosts(page, limit);
        const totalPosts = await postService.getTotalPosts();
        const totalPages = Math.ceil(totalPosts / limit);

        // Lấy danh sách chuyên mục từ bảng blog_categories
        const [blogCategories] = await db
            .promise()
            .query("SELECT id, name FROM blog_categories ORDER BY name ASC");

        res.render("admin/post", {
            posts,
            categories: blogCategories, // Truyền danh mục tin tức (Tips, News...) xuống view
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bài viết:", error);
        res.status(500).send("Có lỗi xảy ra tại hệ thống!");
    }
};
// 2. Thêm mới bài viết
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Y|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-");
}

// Tại hàm create (Thêm bài viết mới), bạn cập nhật dữ liệu nạp vào có thêm trường slug:
const create = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            slug: removeVietnameseTones(req.body.title), // <-- TỰ ĐỘNG SINH ĐUÔI URL Ở ĐÂY
            thumbnail: req.body.thumbnail,
            content: req.body.content,
            category_id: req.body.category_id,
        };

        await postService.createPost(data); // Gọi sang service để lưu
        res.redirect("/admin/dashboard/posts");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi tạo bài viết");
    }
};

// 3. Cập nhật bài viết
// Cập nhật hàm Sửa bài viết (Update)
const update = async (req, res) => {
    try {
        const id = req.params.id; // Lấy ID bài viết từ URL cấu hình (ví dụ: /edit/:id)

        const data = {
            title: req.body.title,
            slug: removeVietnameseTones(req.body.title), // TỰ ĐỘNG CẬP NHẬT LẠI SLUG MỚI TẠI ĐÂY
            thumbnail: req.body.thumbnail,
            content: req.body.content, // Nội dung HTML đã gom từ các phân đoạn
            category_id: req.body.category_id,
            summary: req.body.summary, // Nội dung tóm tắt bài viết
        };

        // Gọi sang service để chạy lệnh UPDATE vào MySQL
        await postService.updatePost(id, data);

        // Thành công thì quay về trang danh sách bài viết Admin
        res.redirect("/admin/dashboard/posts");
    } catch (error) {
        console.error("Lỗi khi cập nhật bài viết (Controller):", error);
        res.status(500).send("Có lỗi xảy ra khi cập nhật bài viết!");
    }
};

// 4. Xóa bài viết
const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        await postService.deletePost(id);
        res.redirect("/admin/dashboard/posts");
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        res.status(500).send("Có lỗi xảy ra tại hệ thống!");
    }
};

module.exports = {
    index,
    create,
    update,
    deletePost,
};
