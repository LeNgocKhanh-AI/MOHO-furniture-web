const ProductModel = require("../../services/product");

exports.home = (req, res) => {

  ProductModel.getAllProducts((err, products) => {

    if(err){
      console.log(err);
      return;
    }

    /* ===== GET REVIEWS ===== */

    ProductModel.getAllReviews((err, reviews) => {

      if(err){
        console.log(err);
        return;
      }

      res.render("page/home", {

        products: products,

        reviews: reviews

      });

    });

  });

};
/* ===== DETAIL ===== */

exports.detail = (req,res)=>{

    const productId = req.params.id;

    ProductModel.getProductDetail(productId,(err,result)=>{

        if(err){

            console.log(err);

            return;
        }

        if(result.length === 0){

            return res.send("Không tìm thấy sản phẩm");
        }

        const product = result[0];

        const images = result;

        res.render("page/productdetail",{

            product,
            images

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
      keyword
    });
  });
};