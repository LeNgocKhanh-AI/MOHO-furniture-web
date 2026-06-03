const ProductModel = require("../../services/product");

exports.home = (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const limit = 8;

  ProductModel.getProductsPagination(currentPage, limit, (err, result) => {
    if (err) {
      console.log("Lỗi phân trang tại Controller:", err);
      return res.status(500).send("Lỗi tải danh sách sản phẩm");
    }

    ProductModel.getAllReviews((err, reviews) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Lỗi tải đánh giá");
      }

      // 🔥 KIỂM TRA ĐOẠN NÀY: Phải có đủ biến titleHeading
      res.render("page/home", {
        products: result.products,
        totalPages: result.totalPages,
        currentPage: currentPage,
        reviews: reviews,
        titleHeading: "Giá siêu tốt", // 👈 BẮT BUỘC PHẢI CÓ DÒNG NÀY
      });
    });
  });
};
/* ===== DETAIL ===== */

exports.detail = (req, res) => {
  const productId = req.params.id;

  ProductModel.getProductDetail(productId, (err, result) => {
    if (err) {
      console.log(err);

      return;
    }

    if (result.length === 0) {
      return res.send("Không tìm thấy sản phẩm");
    }

    const product = result[0];

    const images = result;

    res.render("page/productdetail", {
      product,
      images,
    });
  });
};

/* ===== SEARCH ===== */

exports.searchSuggest = (req, res) => {
  const keyword = req.query.keyword || "";

  if (!keyword) return res.json([]);

  ProductModel.searchProducts(keyword, (err, data) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }

    res.json(data);
  });
};
exports.searchPage = (req, res) => {
  const keyword = req.query.q || "";

  ProductModel.searchProducts(keyword, (err, products) => {
    if (err) return res.send("Lỗi search");

    res.render("page/search", {
      products,
      keyword,
    });
  });
};

/* ===== HIỂN THỊ TRANG SẢN PHẨM THEO DANH MỤC ===== */
exports.categoryPage = (req, res) => {
  // Lấy tên danh mục từ URL (ví dụ: sofa, table...)
  const categoryName = req.params.categoryName;

  // Xử lý phân trang tương tự trang chủ
  const currentPage = parseInt(req.query.page) || 1;
  const limit = 8; // Vẫn giữ 2 dòng x 4 cột

  // Gọi hàm lấy sản phẩm theo danh mục từ Service
  ProductModel.getProductsByCategoryPagination(
    categoryName,
    currentPage,
    limit,
    (err, result) => {
      if (err) {
        console.log("Lỗi lấy danh mục sản phẩm:", err);
        return res.status(500).send("Lỗi hệ thống");
      }

      /* ===== GET REVIEWS (Giữ lại để trang có cấu trúc giống trang home) ===== */
      ProductModel.getAllReviews((err, reviews) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Lỗi tải đánh giá");
        }

        // 🔥 TIẾT KIỆM CODE: Tái sử dụng lại view "page/home"
        // Chỉ khác là mảng "products" bây giờ đã được lọc sạch sẽ theo loại
        res.render("page/home", {
          products: result.products,
          totalPages: result.totalPages,
          currentPage: currentPage,
          reviews: reviews,
          titleHeading:
            categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        });
      });
    },
  );
};
