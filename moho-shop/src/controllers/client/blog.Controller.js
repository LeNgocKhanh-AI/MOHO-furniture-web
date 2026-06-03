// Nạp toàn bộ object chứa các hàm service vào biến blogService
const blogService = require("../../services/blog.service");

class BlogController {
    // [GET] /news/:category_slug
    async index(req, res) {
        try {
            const { category_slug } = req.params;

            // Gọi hàm từ service theo phong cách mới
            const currentCategory =
                await blogService.getCategoryBySlug(category_slug);
            if (!currentCategory) return res.redirect("/");

            const allCategories = await blogService.getAllCategories();
            const recentPosts = await blogService.getRecentPosts(8);
            const posts = await blogService.getPostsByCategoryId(currentCategory.id);

            res.render("page/blog", {
                session: req.session,
                isDetailPage: false,
                currentCategory: currentCategory,
                allCategories: allCategories,
                recentPosts: recentPosts,
                posts: posts,
            });
        } catch (error) {
            console.error("Lỗi trang danh sách blog (Controller):", error);
            res.status(500).send("Lỗi Server");
        }
    }

    // [GET] /news/:category_slug/:post_slug
    async detail(req, res) {
        try {
            const { category_slug, post_slug } = req.params;

            const currentPost = await blogService.getPostBySlug(post_slug);
            if (!currentPost) return res.redirect(`/news/${category_slug}`);

            const allCategories = await blogService.getAllCategories();
            const recentPosts = await blogService.getRecentPosts(8);

            res.render("page/blog", {
                session: req.session,
                isDetailPage: true,
                activeCategorySlug: category_slug,
                allCategories: allCategories,
                recentPosts: recentPosts,
                post: currentPost,
            });
        } catch (error) {
            console.error("Lỗi trang chi tiết blog (Controller):", error);
            res.status(500).send("Lỗi Server");
        }
    }
}

module.exports = new BlogController();
