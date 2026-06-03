-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS moho_db;
USE moho_db;

-- Bảng customer
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_username VARCHAR(50) NOT NULL,
    customer_password VARCHAR(255) NOT NULL,
    customer_firstname VARCHAR(50),
    customer_lastname VARCHAR(50),
    customer_email VARCHAR(100),
    customer_address VARCHAR(255),
    customer_gender ENUM('Male','Female','Other'),
    customer_phone VARCHAR(20)
);

-- Bảng administrator
CREATE TABLE administrator (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_username VARCHAR(50) NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    admin_firstname VARCHAR(50),
    admin_lastname VARCHAR(50),
    admin_email VARCHAR(100),
    admin_address VARCHAR(255),
    admin_phone VARCHAR(20)
);

-- Bảng category
CREATE TABLE category (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    cat_name VARCHAR(100) NOT NULL,
    cat_desc TEXT
);

-- Bảng product
CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    product_sale_price DECIMAL(10,2) DEFAULT NULL,
    product_sku VARCHAR(100),
    product_stock_quantity INT DEFAULT 0,
    product_description TEXT,
    FOREIGN KEY (category_id) REFERENCES category(cat_id) ON DELETE CASCADE
);

-- Bảng order
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME,
    order_status ENUM('pending','completed','cancelled') DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Bảng order_detail
CREATE TABLE order_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,

    total_price DECIMAL(10,2) 
    GENERATED ALWAYS AS (quantity * unit_price) STORED,

    UNIQUE(order_id, product_id),

    FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON DELETE CASCADE,

    FOREIGN KEY (product_id)
    REFERENCES product(product_id)
    ON DELETE CASCADE
);

-- Bảng feedback
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    fullname VARCHAR(100),
    email VARCHAR(100),
    message TEXT NOT NULL,
    status ENUM('new','read','replied','closed') DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Bảng image
CREATE TABLE product_image (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_type ENUM('main','sub') DEFAULT 'sub',
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);
CREATE TABLE product_review (

    review_id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    customer_id INT NOT NULL,

    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),

    review_comment TEXT,

    review_image VARCHAR(255),

    anonymous BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
    REFERENCES product(product_id),

    FOREIGN KEY (customer_id)
    REFERENCES customer(customer_id)

);
CREATE TABLE cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNIQUE,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE cart_item (
  cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT,
  product_id INT,
  quantity INT,
  FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id)
);
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method ENUM('cod','bank','vnpay','momo','qr'),
    amount DECIMAL(10,2),
    status ENUM('pending','success','failed') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
ALTER TABLE orders 
ADD COLUMN total_amount DECIMAL(10,2),
ADD COLUMN shipping_address VARCHAR(255),
ADD COLUMN payment_status ENUM('pending','paid','failed') DEFAULT 'pending';
ALTER TABLE customer 
ADD COLUMN customer_google_id VARCHAR(255) NULL UNIQUE,
ADD COLUMN customer_avatar VARCHAR(500) NULL;

-- Create index for faster lookups
CREATE INDEX idx_customer_google_id ON customer(customer_google_id);
ALTER TABLE product 
ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;

-- Dữ liệu cho phần Tin tức 
-- 1. Bảng Danh mục Blog
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          -- Tips, News, Media, People
    slug VARCHAR(100) NOT NULL UNIQUE    -- tips, news, media, people
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bảng Bài viết
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,                        -- Tóm tắt ngắn hiện ở trang danh sách
    thumbnail VARCHAR(255),              -- Ảnh đại diện bài viết
    content LONGTEXT,                    -- Nơi chứa: [Ảnh 1 + Câu hỏi 1 + Nội dung 1...] dạng HTML
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- Thêm dữ liệu

-- Thay vì TRUNCATE, dùng DELETE để kích hoạt cơ chế xóa dây chuyền (CASCADE)
DELETE FROM blog_categories;

-- Reset lại bộ đếm ID tự động tăng về số 1 cho cả 2 bảng
ALTER TABLE blog_categories AUTO_INCREMENT = 1;
ALTER TABLE posts AUTO_INCREMENT = 1;

-- ==========================================================
-- BƯỚC 1: CHÈN LẠI 4 DANH MỤC GỐC
-- ==========================================================
INSERT INTO blog_categories (id, name, slug) VALUES 
(1, 'Tips', 'tips'),
(2, 'News', 'news'),
(3, 'Media', 'media'),
(4, 'People', 'people');

-- [Bây giờ bạn có thể chạy tiếp các lệnh INSERT INTO posts bình thường...]-------------------------------------------------------

-- Bài Tips 1
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(1, '5 Mẹo bảo quản sofa vải bố tại chung cư luôn sạch như mới', 'meo-bao-quan-sofa-vai-bo', 'Sofa vải bố rất dễ bám bụi và xỉn màu nếu không xử lý đúng cách. Xem ngay 5 tuyệt chiêu chăm sóc sofa hiệu quả tại nhà.', 'https://cdn.hstatic.net/200000065946/article/ghe_sofa_bang_go_tram_tu_nhien_moho_vienna_701_3_7137f884bf0f4559b13998877d9c6c8e_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Tại sao nên hút bụi sofa định kỳ hàng tuần?</h3>
<p>Vải bố có kết cấu dệt hở nên các hạt bụi mịn dễ lọt vào kẽ vải. Việc hút bụi định kỳ ngăn chặn vết bẩn tích tụ thành vết ố đen khó trị.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Cách xử lý vết đổ nước ngọt hoặc cà phê lập tức?</h3>
<p>Hãy dùng khăn khô thấm sạch ngay lập tức theo giấy thấm, tuyệt đối không lau loang lổ làm vết bẩn ăn sâu vào bông nệm bên trong.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Sử dụng baking soda để khử mùi hôi sofa như thế nào?</h3>
<p>Rải một lớp bột baking soda mỏng lên bề mặt ghế, để nguyên trong 20 phút rồi dùng máy hút sạch bột. Sofa sẽ bay sạch mùi thú cưng hoặc ẩm mốc.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Giặt bọc nệm sofa bao lâu một lần là hợp lý?</h3>
<p>Đối với các dòng sofa tách rời vỏ bọc của MOHO, bạn nên tháo vỏ đem giặt máy nhẹ nhàng khoảng 6 tháng một lần để đảm bảo vệ sinh da liễu.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Tránh đặt sofa vải bố ở vị trí nào trong phòng?</h3>
<p>Không nên đặt sát cửa sổ có ánh nắng gắt chiếu trực tiếp liên tục, nhiệt độ cao sẽ làm sợi vải bố bị giòn, dễ rách và phai màu sơn vải.</p>
');

-- Bài Tips 2
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(1, 'Cẩm nang chọn kích thước bàn ăn chuẩn phong thủy và không gian', 'cam-nang-chon-kich-thuoc-ban-an', 'Lựa chọn kích thước bàn ăn không chỉ dựa vào sở thích mà phải cân đối với diện tích phòng bếp và số lượng thành viên.', 'https://cdn.hstatic.net/200000065946/article/bi_quyet_lua_chon_bo_ban_an_dep_phu_hop_cho_khong_gian_phong_bep_nho_chung_cu_4_cfb42fa08552431faeb7db05ef414bf8_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Kích thước tiêu chuẩn cho bàn ăn 4 ghế là bao nhiêu?</h3>
<p>Bàn ăn dành cho 4 người lý tưởng nhất nên có chiều dài từ 120cm đến 140cm, chiều rộng từ 70cm đến 80cm để ngồi thoải mái không chạm khuỷu tay.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Khoảng cách từ bàn ăn đến tường bao nhiêu là đủ?</h3>
<p>Bạn cần chừa tối thiểu một khoảng thoáng từ 80cm - 90cm tính từ cạnh bàn đến vách tường để việc kéo ghế ra vào di chuyển dễ dàng.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Nhà nhỏ căn hộ chung cư nên dùng bàn tròn hay chữ nhật?</h3>
<p>Nên chọn bàn chữ nhật hoặc bàn ăn thông minh kéo dài đặt sát tường để tiết kiệm diện tích tối đa cho lối đi chung.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Chiều cao mặt bàn so với ghế ngồi thế nào là đỡ mỏi?</h3>
<p>Chiều cao tiêu chuẩn mặt bàn ăn từ đất lên là 75cm, phối hợp với ghế ngồi cao tầm 45cm sẽ tạo tư thế ngồi thẳng lưng ăn uống chuẩn khoa học.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Chất liệu mặt bàn nào dễ lau chùi dầu mỡ nhất?</h3>
<p>Các loại gỗ tự nhiên được xử lý sơn phủ lớp PU chống thấm bề mặt chống dầu mỡ bám dính cực tốt, chỉ cần lau nhẹ bằng khăn ẩm là sạch.</p>
');

-- Bài Tips 3
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(1, 'Cách bài trí gương phòng khách giúp nhân đôi diện tích nhà', 'cach-bai-tri-guong-phong-khach', 'Biết cách đặt gương thông minh tại phòng khách sẽ giúp đánh lừa thị giác, mang lại cảm giác thông thoáng hơn rộng rãi hơn.', 'https://cdn.hstatic.net/200000065946/article/goi_y_cach_chon_va_sap_xep_noi_that_phong_ngu_go_tu_nhien_hien_dai_5_bbbdcf87ce3e433f990547908b98df71_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Nên treo gương ở mảng tường nào trong phòng khách?</h3>
<p>Vị trí đắc địa nhất là mảng vách tường ngay phía sau ghế sofa dài, hoặc đối diện cửa ra ban công để đón ánh sáng tự nhiên hắt vào trong nhà.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Kích thước gương trang trí bao nhiêu là hài hòa?</h3>
<p>Hãy lựa chọn các khổ gương lớn có bề rộng bằng 2/3 tổng chiều dài của ghế sofa để tạo cảm giác cân xứng, tránh treo gương quá bé lo lửng.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Tại sao tuyệt đối tránh đặt gương đối diện cửa ra vào?</h3>
<p>Theo phong thủy, đặt gương đối diện trực diện cửa chính sẽ đẩy ngược toàn bộ sinh khí tốt và tài lộc ra ngoài, gây tâm lý bất an khi mở cửa.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Xu hướng khung gương bằng chất liệu gì thịnh hành hiện nay?</h3>
<p>Gương khung viền bằng gỗ cao su tự nhiên sơn màu nâu hạt dẻ mộc mạc đang là gu ưa chuộng nhất trong phong cách kiến trúc Japandi tối giản.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Vệ sinh gương bị mờ sương ố nước bằng mẹo gì?</h3>
<p>Dùng một chút dung dịch cồn y tế hoặc kem đánh răng xoa nhẹ lên mảng gương ố, sau đó lấy khăn lau kính chuyên dụng chùi sạch là gương sáng bong.</p>
');


-- ----------------------------------------------------------
-- DANH MỤC 2: NEWS (ID = 2)
-- ----------------------------------------------------------

-- Bài News 1
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(2, 'Nội Thất MOHO khai trương showroom thứ 5 tại thành phố Cần Thơ', 'moho-khai-truong-showroom-can-tho', 'MOHO chính thức đổ bộ thị trường miền Tây Nam Bộ với không gian trải nghiệm nội thất sang trọng rộng hơn 500m2 tại Cần Thơ.', 'https://cdn.hstatic.net/200000065946/article/goi_y_cach_chon_va_sap_xep_noi_that_phong_ngu_go_tu_nhien_hien_dai_5_bbbdcf87ce3e433f990547908b98df71_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Địa chỉ chính thức của showroom MOHO Cần Thơ ở đâu?</h3>
<p>Showroom mới tọa lạc tại vị trí đắc địa trung tâm quận Ninh Kiều, TP. Cần Thơ giúp khách hàng miền Tây thuận tiện tham quan mua sắm.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Có những chương trình ưu đãi nào dịp khai trương?</h3>
<p>MOHO tung ra gói giảm giá sập sàn lên đến 30% cho toàn bộ sản phẩm giường ngủ, sofa và tặng kèm voucher mua sắm trị giá 500k.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Chính sách giao hàng về các tỉnh miền Tây thế nào?</h3>
<p>MOHO áp dụng chính sách miễn phí vận chuyển và lắp đặt tận nhà hoàn toàn cho các đơn hàng đạt hạn mức tại nội ô TP Cần Thơ.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Showroom Cần Thơ trưng bày những dòng bộ sưu tập nào?</h3>
<p>Tại đây có đầy đủ các concept phòng khách, phòng ăn từ các bộ sưu tập đình đám bán chạy nhất của hãng như Vienna, Oslo, Malaga.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Thời gian mở cửa đón khách của showroom thế nào?</h3>
<p>Showroom sẵn sàng phục vụ quý khách hàng liên tục từ 8h00 sáng đến 21h00 tối tất cả các ngày trong tuần, kể cả ngày Thứ Bảy và Chủ Nhật.</p>
');

-- Bài News 2
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(2, 'Ra mắt bộ sưu tập nội thất tràm tự nhiên chuẩn quốc tế', 'ra-mat-bo-suu-tap-tram-tu-nhien', 'Bộ sưu tập mới sử dụng 100% gỗ tràm tự nhiên đạt chứng nhận bảo vệ rừng quốc tế FSC bền bỉ và tinh tế.', 'https://cdn.hstatic.net/200000065946/article/bi_quyet_lua_chon_bo_ban_an_dep_phu_hop_cho_khong_gian_phong_bep_nho_chung_cu_4_cfb42fa08552431faeb7db05ef414bf8_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Ý tưởng thiết kế cốt lõi của BST mới này là gì?</h3>
<p>Bộ sưu tập mang hơi thở đương đại pha lẫn nét truyền thống Á Đông, tôn vinh những đường vân tự nhiên uốn lượn nguyên bản của thớ gỗ tràm.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Chứng nhận FSC của gỗ tràm mang ý nghĩa gì?</h3>
<p>Chứng chỉ FSC đảm bảo nguyên liệu gỗ được khai thác hoàn toàn từ nguồn rừng trồng tái sinh hợp pháp, không hủy hoại môi trường sinh thái.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Khả năng chống mối mọt của dòng sản phẩm này ra sao?</h3>
<p>Gỗ tràm tự nhiên bản chất chứa hàm lượng tinh dầu cao kết hợp sấy nhiệt tiêu chuẩn xuất khẩu giúp sản phẩm kháng mối mọt cực tốt.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Bộ sưu tập bao gồm những món nội thất cơ bản nào?</h3>
<p>Bộ sưu tập trọn gói bao gồm: Giường ngủ vạt tấm, Tủ đầu giường, Kệ tivi phòng khách và Tủ quần áo hệ cửa lùa đa năng.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Chế độ bảo hành chính hãng được áp dụng như thế nào?</h3>
<p>Tất cả sản phẩm bằng gỗ tràm tự nhiên thuộc bộ sưu tập này đều hưởng cam kết bảo hành kết cấu dài hạn lên tới 2 năm từ nhà sản xuất.</p>
');

-- Bài News 3
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(2, 'MOHO đạt Top 10 thương hiệu nội thất xanh được yêu thích nhất', 'moho-dat-top-10-thuong-hieu-noi-that-xanh', 'Giải thưởng vinh danh những nỗ lực bền bỉ của MOHO trong việc ứng dụng vật liệu thân thiện môi trường, giảm phát thải.', 'https://cdn.hstatic.net/200000065946/article/ghe_sofa_bang_go_tram_tu_nhien_moho_vienna_701_3_7137f884bf0f4559b13998877d9c6c8e_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Giải thưởng nội thất xanh này do cơ quan nào tổ chức?</h3>
<p>Giải thưởng uy tín do Hiệp hội Gỗ và Mỹ nghệ phối hợp cùng Bộ Công Thương khảo sát đánh giá và bình chọn thường niên từ người dùng.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Tiêu chuẩn keo dán độc quyền của MOHO có gì đặc biệt?</h3>
<p>MOHO cam kết sử dụng 100% keo đạt chuẩn CARB-P2, kiểm soát nồng độ phát thải Formaldehyde gần như bằng 0, an toàn tuyệt đối cho trẻ nhỏ.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Đóng góp của MOHO vào hoạt động trồng rừng bảo vệ thiên nhiên?</h3>
<p>Trích một phần doanh thu từ mỗi đơn hàng bán ra, định kỳ hàng năm tổ chức phát động chiến dịch phủ xanh đất trống đồi trọc khắp cả nước.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Phản hồi của người tiêu dùng về chất lượng sản phẩm xanh?</h3>
<p>Hơn 95% khách hàng khẳng định sản phẩm của MOHO hoàn toàn không có mùi hắc nồng nặc của hóa chất khi vừa khui thùng lắp ráp tại phòng ngủ.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Mục tiêu phát triển bền vững tiếp theo của hãng là gì?</h3>
<p>MOHO định hướng hướng tới mục tiêu tự chủ 100% bao bì carton tái chế đóng gói sản phẩm nhằm triệt tiêu hoàn toàn rác thải xốp nilon.</p>
');


-- ----------------------------------------------------------
-- DANH MỤC 3: MEDIA (ID = 3)
-- ----------------------------------------------------------

-- Bài Media 1
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(3, 'Video toàn cảnh quy trình sản xuất nội thất tự động hóa tại nhà máy', 'video-quy-trinh-san-xuat-nha-may', 'Khám phá dây chuyền máy móc CNC hiện đại nhập khẩu trực tiếp từ Châu Âu đạt công suất hàng vạn sản phẩm mỗi tháng.', 'https://cdn.hstatic.net/200000065946/article/bi_quyet_lua_chon_bo_ban_an_dep_phu_hop_cho_khong_gian_phong_bep_nho_chung_cu_4_cfb42fa08552431faeb7db05ef414bf8_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Nhà máy sản xuất chính của MOHO đặt tại đâu?</h3>
<p>Hệ thống nhà máy quy mô lớn hơn 10 hecta đặt tại tỉnh Bình Dương, đạt tiêu chuẩn khắt khe để xuất khẩu sang Mỹ, Nhật Bản.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Độ chính xác của các dòng máy cắt CNC Châu Âu thế nào?</h3>
<p>Hệ thống lập trình tự động cắt chính xác đến từng milimet, đảm bảo các chi tiết mộng gỗ lắp ráp khớp khít 100% không sai lệch.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Công đoạn sấy gỗ tự nhiên diễn ra trong bao lâu?</h3>
<p>Gỗ thô được đưa vào lò sấy hơi nước tuần hoàn liên tục từ 15 đến 20 ngày để đưa độ ẩm gỗ về mức lý tưởng 8-12%, triệt tiêu độ cong vênh.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Quy trình kiểm tra chất lượng đầu ra QC gồm mấy bước?</h3>
<p>Mỗi sản phẩm phải trải qua 3 vòng kiểm tra nghiêm ngặt: Kiểm tra bề mặt sơn, thử nghiệm khả năng chịu tải trọng và độ kín bao bì đóng gói.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Xem trọn vẹn thước phim phóng sự này ở kênh nào?</h3>
<p>Khách hàng có thể đón xem trực tiếp trên fanpage hoặc kênh Youtube chính thức của Nội Thất MOHO để thấy rõ quy mô sản xuất chân thực.</p>
');

-- Bài Media 2
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(3, 'Phóng sự HTV9 nói về giải pháp nội thất bảo vệ sức khỏe gia đình', 'htv9-phong-su-noi-that-suc-khoe', 'Đài truyền hình thành phố Hồ Chí Minh đưa tin đánh giá cao tiêu chuẩn không mùi Formandehit độc hại trên sản phẩm MOHO.', 'https://cdn.hstatic.net/200000065946/article/ghe_sofa_bang_go_tram_tu_nhien_moho_vienna_701_3_7137f884bf0f4559b13998877d9c6c8e_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Formaldehyde trong đồ nội thất cũ nguy hiểm như thế nào?</h3>
<p>Chất khí Formaldehyde phát thải từ keo dán gỗ kém chất lượng là tác nhân gây dị ứng da, viêm đường hô hấp nguy hiểm tiềm tàng.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Chứng nhận sinh thái quốc tế nào chứng minh độ an toàn?</h3>
<p>Đó là chứng nhận quốc tế CARB-P2 và EPA danh giá, bắt buộc phải có nếu muốn thông quan nhập khẩu vào thị trường Mỹ khắt khe.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Đội ngũ chuyên gia y tế nhận định thế nào về nội thất sạch?</h3>
<p>Các chuyên gia khuyên các gia đình có em bé sơ sinh hoặc người già hen suyễn nên ưu tiên dùng dòng gỗ sạch chuẩn để bảo vệ hệ hô hấp.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Phóng sự truyền hình được quay trực tiếp tại đâu?</h3>
<p>Biên tập viên đài HTV9 đã trực tiếp ghi hình tại căn hộ mẫu sử dụng trọn bộ tủ bếp và phòng ngủ an toàn sinh thái của cư dân Vinhomes.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Khách hàng làm sao nhận biết sản phẩm đạt chuẩn khi mua?</h3>
<p>Tất cả thùng hàng đóng gói của MOHO đều dán tem chứng thực kiểm định chất lượng và mã QR check thông số xuất xưởng minh bạch.</p>
');

-- Bài Media 3
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(3, 'Bộ ảnh Lookbook: Không gian sống tối giản theo phong cách Bắc Âu Scandi', 'lookbook-khong-gian-toi-gian-bac-au', 'Chiêm ngưỡng trọn bộ ảnh bố trí không gian thực tế đầy cảm hứng phối hợp giữa tông màu gỗ tự nhiên ấm áp và vải xám tro.', 'https://cdn.hstatic.net/200000065946/article/goi_y_cach_chon_va_sap_xep_noi_that_phong_ngu_go_tu_nhien_hien_dai_5_bbbdcf87ce3e433f990547908b98df71_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Màu sắc chủ đạo của phong cách Scandinavian là gì?</h3>
<p>Phong cách ưu tiên sử dụng tông nền tường trắng xám thanh lịch làm nổi bật lên màu gỗ sồi vàng nhạt tinh tế của các vật dụng nội thất.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Làm sao tối ưu ánh sáng cho căn phòng theo đúng điệu Bắc Âu?</h3>
<p>Bố trí rèm cửa hai lớp mỏng nhẹ đón nắng sớm, đi kèm hệ thống đèn vàng đứng góc phòng lan tỏa ánh sáng ấm áp lung linh.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Điểm nhấn mộc mạc của thảm trải sàn trong Lookbook này?</h3>
<p>Chiếc thảm cói tự nhiên tròn dệt thô đặt dưới chân ghế đơn thư giãn tạo một điểm kết nối không gian vô cùng gần gũi với thiên nhiên.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Mẫu kệ sách nào xuất hiện ấn tượng nhất bộ ảnh?</h3>
<p>Đó là mẫu kệ sách phân tầng không vách ngăn sau, vừa làm nhiệm vụ lưu trữ tài liệu vừa làm vách ngăn hờ giữa phòng khách và phòng làm việc.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Tải file ảnh Lookbook chất lượng cao thiết kế ở đâu?</h3>
<p>Quý bạn đọc có thể nhấn vào liên kết Google Drive đính kèm cuối bài để lưu bộ ảnh nét căng làm tư liệu ý tưởng decor cho căn nhà mình.</p>
');


-- ----------------------------------------------------------
-- DANH MỤC 4: PEOPLE (ID = 4)
-- ----------------------------------------------------------

-- Bài People 1
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(4, 'Trò chuyện cùng kiến trúc sư trưởng bộ phận R&D sáng tạo thiết kế', 'tro-chuyen-kien-truc-su-truong-moho', 'Khám phá hậu trường phía sau bản vẽ phát thảo của các mẫu sản phẩm nội thất tối giản, công năng thông minh độc quyền.', 'https://cdn.hstatic.net/200000065946/article/ghe_sofa_bang_go_tram_tu_nhien_moho_vienna_701_3_7137f884bf0f4559b13998877d9c6c8e_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Nhà thiết kế chính đứng sau các sản phẩm MOHO là ai?</h3>
<p>Anh Nguyễn Minh Hoàng - Chuyên gia thiết kế công nghiệp có hơn 10 năm học tập tu nghiệp kiến trúc nội thất tại Đan Mạch điều hành.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Thử thách khó khăn nhất khi lên ý tưởng một chiếc tủ giày là gì?</h3>
<p>Làm sao chiếc tủ phải có độ sâu cực mỏng chỉ 24cm để vừa khít hành lang căn hộ chung cư nhưng sức chứa vẫn đạt tối đa 20 đôi giày.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Đội ngũ R&D mất bao lâu để hiện thực hóa từ bản vẽ đến thực tế?</h3>
<p>Trung bình từ khâu phác thảo ý tưởng vẽ 3D, dựng mô hình mẫu thử nghiệm chịu lực đến sản xuất hàng loạt mất khoảng 3 đến 4 tháng trời.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Triết lý thiết kế mà anh luôn theo đuổi suốt sự nghiệp là gì?</h3>
<p>Thiết kế vị nhân sinh - Mọi món đồ nội thất làm ra trước hết phải phục vụ sự tiện lợi tối đa cho các hành vi sinh hoạt của con người.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Lời khuyên của chuyên gia dành cho các bạn trẻ mê ngành decor?</h3>
<p>Hãy liên tục quan sát thực tế cuộc sống, đừng chỉ bó hẹp tư duy trên màn hình máy tính, chất liệu đời thường mới là chìa khóa sáng tạo.</p>
');

-- Bài People 2
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(4, 'Tâm sự nghề thợ mộc - Những bàn tay thầm lặng thổi hồn vào gỗ', 'tam-su-nghe-tho-moc-moho', 'Lắng nghe chia sẻ của những người thợ cả lành nghề gắn bó đời mình bên những lát bào, mông gỗ tại xưởng máy.', 'https://cdn.hstatic.net/200000065946/article/goi_y_cach_chon_va_sap_xep_noi_that_phong_ngu_go_tu_nhien_hien_dai_5_bbbdcf87ce3e433f990547908b98df71_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Người thợ mộc cần tố chất quan trọng nhất là gì?</h3>
<p>Đó chính là sự kiên nhẫn tỉ mỉ tuyệt đối. Gỗ tự nhiên mỗi cây mỗi tính, thợ mộc phải khéo léo chọn mảng vân đẹp đặt ra mặt tiền sản phẩm.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Công đoạn chà nhám thủ công bằng tay có thay thế được bằng máy?</h3>
<p>Máy móc chà phẳng mảng lớn cực nhanh, nhưng ở các góc cua ngã ba của chiếc ghế mây mộc mạc, chỉ có bàn tay con người mới vuốt mịn mượt được.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Chú Ba - Thợ cả xưởng lắp ráp đã gắn bó bao nhiêu năm với xưởng?</h3>
<p>Chú Ba đã dành trọn hơn 15 năm thanh xuân cống hiến gắn bó từ ngày đầu xưởng gỗ thô sơ cho đến khi nhà máy chuyển mình tự động hóa hiện đại.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Cảm xúc của người thợ khi nhìn thấy đứa con tinh thần hoàn thiện?</h3>
<p>Hạnh phúc khôn xiết khi nhìn ngắm từng kiện hàng xếp lên xe tải xuất khẩu, biết rằng sản phẩm bàn tay mình làm ra sẽ làm đẹp cho ngôi nhà xa xôi.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Thế hệ trẻ ngày nay có còn mặn mà nối nghiệp mộc truyền thống?</h3>
<p>MOHO liên tục mở các lớp đào tạo học nghề mộc có lương, thu hút rất nhiều bạn trẻ đam mê kỹ thuật cơ khí gỗ tham gia kế thừa.</p>
');

-- Bài People 3
INSERT INTO posts (category_id, title, slug, summary, thumbnail, content) VALUES 
(4, 'Đội ngũ giao hàng lắp đặt tận tâm - Gạch nối niềm tin khách hàng', 'doi-ngu-giao-hang-lap-dat-tan-tam', 'Họ là những người trực tiếp mang niềm vui vuông vắn đến không gian sống, hoàn thiện công đoạn cuối cùng của dịch vụ.', 'https://cdn.hstatic.net/200000065946/article/bi_quyet_lua_chon_bo_ban_an_dep_phu_hop_cho_khong_gian_phong_bep_nho_chung_cu_4_cfb42fa08552431faeb7db05ef414bf8_large.jpg',
'
<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>1. Một ngày làm việc của nhân viên giao nhận MOHO bắt đầu từ mấy giờ?</h3>
<p>Đội ngũ tài xế và nhân viên kỹ thuật có mặt từ 7h00 sáng tại kho tổng để nhận danh sách phiếu giao, bốc xếp kiểm đếm hàng cẩn thận lên thùng xe.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>2. Gặp chung cư lầu cao không có thang máy, các anh xử lý ra sao?</h3>
<p>Không quản ngại khó khăn vất vả, các anh phối hợp khênh vác bộ thang lầu từng thùng hàng nặng cồng kềnh lên tận phòng bàn giao cho chủ nhà.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>3. Thời gian hoàn thành lắp ráp một hệ tủ quần áo mất bao lâu?</h3>
<p>Nhờ tay nghề kỹ thuật cao cùng bản vẽ chi tiết hóa, hai nhân viên chỉ mất vỏn vẹn từ 45 đến 60 phút để dựng hoàn chỉnh một hệ tủ chắc chắn.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>4. Nguyên tắc "3 không" khi giao hàng tại nhà khách là gì?</h3>
<p>Không gây ồn ào mất trật tự chung, Không hút thuốc làm ám mùi phòng kín của khách, và Tuyệt đối không nhận tiền bồi dưỡng Tip của chủ nhà.</p>

<img src="https://cdn.hstatic.net/200000065946/file/gi_ng_ng_g__tr_m_t_nhi_n_moho_vienna_2_828e184fa93448498fe879ee21a0cc4a.jpg">
<h3>5. Kỷ niệm đáng nhớ nhất trên những hành trình vạn dặm giao hàng?</h3>
<p>Đó là cái gật đầu mỉm cười ưng ý và ly nước chanh đá mát lạnh của chủ nhà trao tặng giữa trưa nắng gắt, xua tan mọi mệt mỏi của anh em.</p>
');

-- Update ảnh

--1
UPDATE posts 
SET 
    thumbnail = 'https://cdn.hstatic.net/files/200000065946/article/kinh-nghiem-chon-noi-that-can-tho-cho-nha-nho_5598f921f3a24ebdb6a346ddebbb5f82_1024x1024.jpg',
    content = '
        <img src="https://cdn.hstatic.net/files/200000065946/article/kinh-nghiem-chon-noi-that-can-tho-cho-nha-nho_5598f921f3a24ebdb6a346ddebbb5f82_1024x1024.jpg" alt="Kinh nghiệm chọn nội thất Cần Thơ cho nhà nhỏ">
        <h3>1. Làm thế nào để tối ưu không gian cho căn hộ nhỏ tại Cần Thơ?</h3>
        <p>Đối với những không gian có diện tích hạn chế, việc lựa chọn nội thất thông minh và có kích thước vừa vặn là yếu tố quyết định. Bạn nên ưu tiên các sản phẩm nội thất lắp ráp, thiết kế tối giản, có gam màu sáng như sồi tự nhiên hoặc trắng để tạo cảm giác đánh lừa thị giác, giúp căn phòng trông rộng rãi và thông thoáng hơn rất nhiều.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/wroom-noi-that-moho-ninh-kieu-can-tho_799c75ff3f3647458be4bfd9da820d86_1024x1024.jpg" alt="Showroom nội thất MOHO Ninh Kiều Cần Thơ">
        <h3>2. Trải nghiệm mua sắm nội thất tại Ninh Kiều Cần Thơ có gì đặc biệt?</h3>
        <p>Khi ghé thăm các không gian trưng bày nội thất hiện đại tại Cần Thơ, bạn sẽ được trực tiếp trải nghiệm và kiểm tra chất lượng gỗ. Việc nhìn tận mắt, sờ tận tay giúp bạn dễ dàng hình dung cách bố trí các sản phẩm từ phòng khách, phòng ngủ đến phòng ăn sao cho hài hòa với gu thẩm mỹ và kiến trúc thực tế của gia đình mình.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-sofa-gia-re-can-tho_54c7285c56834de591792e423b0a3e68_1024x1024.jpg" alt="Mẫu sofa giá rẻ Cần Thơ">
        <h3>3. Chọn sofa phòng khách thế nào để vừa bền vừa hợp túi tiền?</h3>
        <p>Sofa là linh hồn của phòng khách. Tại thị trường Cần Thơ, các mẫu sofa băng bọc vải thô hoặc vải nỉ cao cấp với khung gỗ tự nhiên đang rất được ưa chuộng. Dòng sản phẩm này không chỉ mang lại cảm giác êm ái, trẻ trung mà còn có mức giá cực kỳ phải chăng, phù hợp với các gia đình trẻ mong muốn tối ưu chi phí đầu tư ban đầu.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/he-phong-khach-gia-re-tai-can-tho__1__564b3de3eaf142808bb2b68c9549491a_1024x1024.jpg" alt="Hệ phòng khách giá rẻ tại Cần Thơ">
        <h3>4. Làm sao để đồng bộ hóa nội thất phòng khách một cách tiết kiệm?</h3>
        <p>Thay vì mua lẻ tẻ từng món, bạn nên cân nhắc các combo hoặc hệ nội thất phòng khách trọn gói bao gồm bàn sofa, kệ tivi và tủ trang trí. Việc chọn mua theo hệ thiết kế đồng bộ không chỉ giúp căn phòng đạt độ thẩm mỹ cao nhất nhờ sự nhất quán về màu sắc, chất liệu mà còn giúp bạn nhận được mức chiết khấu tốt hơn từ nhà sản xuất.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/tu-quan-ao-go-cong-nghiep-mdf-mfc-hdf_ed001b74a98244d7a0ae362f50b9647b_1024x1024.jpg" alt="Tủ quần áo gỗ công nghiệp MDF MFC HDF">
        <h3>5. Có nên dùng tủ quần áo gỗ công nghiệp chuẩn sinh thái không?</h3>
        <p>Tủ quần áo chế tác từ gỗ công nghiệp cao cấp tiêu chuẩn (như MDF, MFC chống ẩm đạt chuẩn CARB-P2) là giải pháp hoàn hảo cho phòng ngủ hiện đại. Chúng không chỉ có khả năng chống cong vênh, mối mọt vượt trội mà còn cực kỳ an toàn cho sức khỏe người sử dụng nhờ kiểm soát chặt chẽ hàm lượng phát thải formaldehyde, đảm bảo không gian sống trong lành.</p>
    '
WHERE id = 1;


-- 2
UPDATE posts 
SET 
    thumbnail = 'https://cdn.hstatic.net/files/200000065946/article/thiet-ke-noi-that-nha-o_3f66eb9bd6e947299d936fae747616e3_1024x1024.jpg',
    content = '
        <img src="https://cdn.hstatic.net/files/200000065946/article/thiet-ke-noi-that-nha-o_3f66eb9bd6e947299d936fae747616e3_1024x1024.jpg" alt="Thiết kế nội thất nhà ở hiện đại">
        <h3>1. Nguyên tắc vàng khi bắt tay vào thiết kế nội thất nhà ở là gì?</h3>
        <p>Trước khi mua sắm, việc định hình phong cách chủ đạo (như Minimalism, Scandivanian hay Hiện đại) là cực kỳ quan trọng. Bạn cần phân chia công năng rõ ràng giữa các khu vực sinh hoạt, đồng thời đo đạc chính xác diện tích mặt sàn để đảm bảo các món nội thất lớn như sofa, tủ áo khi đặt vào không làm bóp nghẹt lối đi lại của gia đình.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/phong-cach-noi-that-nha-vuong_adffeb99cf164f849792bd48489bf089_1024x1024.jpg" alt="Phong cách nội thất nhà vuông">
        <h3>2. Nhà có kết cấu vuông vắn thì nên bố trí phòng khách ra sao?</h3>
        <p>Những căn nhà có form dáng vuông vức là lợi thế lớn trong phong thủy và thiết kế. Để tôn dáng cho kiểu nhà này, bạn nên đặt một bộ sofa góc hoặc sofa băng đối diện trực diện với hệ kệ tivi. Cách bài trí này vừa tạo ra tâm điểm đối xứng hoàn hảo cho căn phòng, vừa giữ được khoảng trống trung tâm giúp không gian thông thoáng, tràn ngập ánh sáng tự nhiên.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/phong-an-bao-nhieu-m2-la-hop-ly__1__6df59fac8c404b8d8bc468fb078f9b94_1024x1024.jpg" alt="Diện tích phòng ăn tiêu chuẩn">
        <h3>3. Diện tích phòng ăn bao nhiêu m2 là hợp lý cho gia đình 4-6 người?</h3>
        <p>Một khu vực ăn uống lý tưởng thường dao động từ 12m2 đến 15m2 để có đủ khoảng lùi cho ghế ngồi và lối đi sau lưng. Đối với các căn hộ vừa và nhỏ, giải pháp hoàn hảo là chọn các bộ bàn ăn 4 ghế hoặc 6 ghế có thiết kế chân thon gọn, kết hợp mặt gỗ sáng màu để tạo cảm giác nhẹ nhàng, không bị bí bách mệt mỏi khi cả nhà quây quần.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/hi-phi-lam-noi-that-tron-goi-nha-50m2_cee676f5cd8542bc88ef7974ad0f2817_1024x1024.jpg" alt="Chi phí làm nội thất trọn gói">
        <h3>4. Dự toán chi phí làm nội thất trọn gói cho nhà diện tích 50m2?</h3>
        <p>Với diện tích khoảng 50m2, việc tự mua lẻ tẻ rất dễ làm thâm hụt ngân sách. Thay vào đó, việc lên kế hoạch mua sắm trọn gói theo các module lắp ráp sẵn sẽ giúp bạn kiểm soát chi phí cực tốt. Mức đầu tư sẽ được tối ưu tối đa nhờ giảm thiểu chi phí đo đạc tùy biến riêng lẻ, giúp các gia đình trẻ sở hữu không gian sống tiện nghi chỉ với ngân sách vừa phải.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/hi-phi-lam-noi-that-tron-goi-nha-50m2_e3d442e5f8884beb89caba17e8936a85_1024x1024.jpg" alt="Tối ưu phòng ngủ nhà 50m2">
        <h3>5. Làm thế nào để phòng ngủ nhỏ trở nên đa năng và ngăn nắp?</h3>
        <p>Chìa khóa nằm ở việc chọn nội thất tích hợp. Hãy ưu tiên sử dụng tủ quần áo kịch trần hoặc tủ cửa lùa để tiết kiệm không gian mở cánh. Bên cạnh đó, một chiếc giường ngủ có hộc kéo dưới gầm hoặc tab đầu giường treo tường nhỏ gọn sẽ là những trợ thủ đắc lực giúp bạn lưu trữ chăn màn, đồ cá nhân gọn gàng mà không tốn thêm một mét vuông sàn nào.</p>
    '
WHERE id = 2;


-- 3

UPDATE posts 
SET 
    thumbnail = 'https://cdn.hstatic.net/files/200000065946/article/nguyen-tac-bo-tri-ban-lam-viec-hop-phong-thuy_f3e55caea7d74d5e8e17c2d8c31a0835_1024x1024.jpg',
    content = '
        <img src="https://cdn.hstatic.net/files/200000065946/article/nguyen-tac-bo-tri-ban-lam-viec-hop-phong-thuy_f3e55caea7d74d5e8e17c2d8c31a0835_1024x1024.jpg" alt="Nguyên tắc bố trí bàn làm việc hợp phong thủy">
        <h3>1. Vị trí đặt bàn làm việc lý tưởng nhất trong phòng là đâu?</h3>
        <p>Theo nguyên tắc phong thủy, bàn làm việc nên được đặt ở vị trí nhìn thấy cửa ra vào nhưng không nằm trên đường thẳng đâm trực diện với cửa. Phía sau lưng người ngồi nên là một bức tường vững chãi (gọi là điểm tựa sơn), tránh đặt bàn quay lưng ra cửa sổ hoặc lối đi để người làm việc không bị giật mình, luôn giữ được sự tập trung cao nhất.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/ac-bo-tri-ban-lam-viec-hop-phong-thuy_267f2e1243784868a4e36974b24b4ad7_1024x1024.jpg" alt="Chọn kiểu dáng bàn làm việc">
        <h3>2. Nên lựa chọn kiểu dáng bàn làm việc nào cho không gian tại nhà?</h3>
        <p>Nếu bạn làm việc tại nhà (Home Office), hãy ưu tiên các mẫu bàn có thiết kế đường nét gọn gàng, vuông vắn bằng chất liệu gỗ tự nhiên hoặc gỗ công nghiệp cao cấp chuẩn sinh thái. Một chiếc bàn gỗ chân sắt thanh lịch hoặc bàn có tích hộc kéo nhỏ sẽ vừa đảm bảo tính thẩm mỹ hiện đại, vừa mang lại năng lượng bền vững, hanh thông cho sự nghiệp.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/o-tri-ban-lam-viec-hop-phong-thuy__3__252655e359334b63b112e5bec1ef5160_1024x1024.jpg" alt="Bố trí ánh sáng góc làm việc">
        <h3>3. Tận dụng ánh sáng tự nhiên cho góc làm việc như thế nào là đúng cách?</h3>
        <p>Ánh sáng tự nhiên là nguồn năng lượng tuyệt vời kích thích tư duy sáng tạo. Tuy nhiên, bạn không nên để ánh nắng mặt trời chiếu thẳng vào màn hình máy tính gây chói mắt. Hãy đặt bàn làm việc vuông góc hoặc chếch một góc so với cửa sổ, kết hợp sử dụng rèm cuốn để chủ động điều tiết ánh sáng dịu nhẹ vào phòng.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/o-tri-ban-lam-viec-hop-phong-thuy__1__61e9c70e7ea346ed94488df58d907361_1024x1024.jpg" alt="Sắp xếp đồ vật trên bàn làm việc">
        <h3>4. Quy tắc "Tả Thanh Long, Hữu Bạch Hổ" khi xếp đồ trên bàn là gì?</h3>
        <p>Đây là quy tắc sắp xếp đồ vật kinh điển giúp cân bằng năng lượng trên mặt bàn. Phía bên trái bàn (Thanh Long - tượng trưng cho năng lượng động) nên đặt các vật cao hoặc đồ điện tử như máy tính, đèn bàn, tài liệu chồng cao. Phía bên phải bàn (Bạch Hổ - tượng trưng cho năng lượng tĩnh) nên để các vật thấp hơn như hộp bút, sổ ghi chú nhỏ hoặc một ly nước sạch.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/ac-bo-tri-ban-lam-viec-hop-phong-thuy_b741c8c47f3c4eb6baa8cc4ddd84024d_1024x1024.jpg" alt="Cây phong thủy góc làm việc">
        <h3>5. Loại cây xanh nào phù hợp để trang trí bàn làm việc sinh tài lộc?</h3>
        <p>Để thanh lọc không khí từ các thiết bị điện tử và tăng thêm mảng xanh thư giãn, bạn nên đặt một chậu cây phong thủy nhỏ trên bàn. Các loại cây như Kim Tiền, Vạn Lộc, Phát Tài hay Sen Đá không chỉ dễ chăm sóc trong môi trường thiếu nắng mà còn mang ý nghĩa thu hút tài lộc, may mắn và giảm bớt căng thẳng cực kỳ hiệu quả.</p>
    '
WHERE id = 3;



-- 4
UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/cac-loai-nem-tac-dong-den-suc-khoe-con-nguoi-nhu-the-nao_8e97f6f048a3401998c88e3eef122722_1024x1024.jpg',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/cac-loai-nem-tac-dong-den-suc-khoe-con-nguoi-nhu-the-nao_8e97f6f048a3401998c88e3eef122722_1024x1024.jpg" alt="Các loại nệm tác động đến sức khỏe con người như thế nào">
        <h3>1. Chọn nệm sai cách sẽ ảnh hưởng đến sức khỏe lâu dài như thế nào?</h3>
        <p>Một chiếc nệm quá cứng hoặc quá mềm đều là tác nhân trực tiếp gây ra các cơn đau lưng mạn tính. Khi nệm không nâng đỡ đúng cấu trúc sinh học, cột sống của bạn sẽ bị cong vẹo suốt 7-8 tiếng mỗi đêm, dẫn đến tình trạng mệt mỏi, uể oải, mất ngủ kéo dài và về lâu dài sẽ làm đẩy nhanh quá trình thoái hóa xương khớp.</p>

        <img src="https://file.hstatic.net/200000065946/file/ua-viec-chon-nem-phu-hop-voi-suc-khoe_2220d34a54c74e4bb2eb9dced242c844_grande.jpeg" alt="Tầm quan trọng của việc chọn nệm phù hợp với sức khỏe">
        <h3>2. Làm sao để nhận biết một chiếc nệm có độ nâng đỡ lý tưởng?</h3>
        <p>Nệm tốt cho sức khỏe phải đảm bảo nguyên tắc giữ cho cột sống luôn ở trạng thái thẳng tự nhiên khi nằm nghiêng và giữ được đường cong chữ S khi nằm ngửa. Bạn nên thử nệm bằng cách nằm khoảng 10-15 phút; nếu cảm nhận được các vùng như gáy, vai, hông và thắt lưng được ôm trọn, không có cảm giác bị hẫng hay đau nhức thì đó là chiếc nệm phù hợp.</p>

        <img src="https://file.hstatic.net/200000065946/file/o-kha-nang-ho-tro-toi-uu-cho-cot-song_7a85069a7c8f4bf4bcdac5831decfc60_grande.jpg" alt="Khả năng hỗ trợ tối ưu cho cột sống">
        <h3>3. Vì sao nệm cao su thiên nhiên luôn được các chuyên gia khuyên dùng?</h3>
        <p>Nệm cao su thiên nhiên sở hữu độ đàn hồi và chịu lực cực kỳ đồng đều, giúp phân bổ trọng lượng cơ thể một cách hoàn hảo. Nhờ cấu trúc bọt hở độc đáo, dòng nệm này còn mang lại khả năng thoáng khí tối đa, kháng khuẩn tự nhiên, giảm thiểu hiện tượng hầm bí lưng, rất thích hợp với khí hậu nóng ẩm tại Việt Nam.</p>

        <img src="https://file.hstatic.net/200000065946/file/cau-tao-nem-lo-xo-tui-doc-lap_e974b8a9ed7c49e687a77f7506e2c482_grande.jpg" alt="Cấu tạo nệm lò xo túi độc lập">
        <h3>4. Nệm lò xo túi độc lập vận hành như thế nào để tránh làm phiền người bên cạnh?</h3>
        <p>Khác với lò xo liên kết cũ dễ gây tiếng động, hệ thống lò xo túi độc lập bao bọc từng con lò xo trong một túi vải riêng biệt. Cơ chế này giúp các con lò xo co giãn hoàn toàn độc lập, hấp thụ lực cục bộ tại vị trí tiếp xúc. Nhờ đó, khi bạn trở mình hay thức dậy giữa đêm, chuyển động hoàn toàn không truyền sang vùng bên cạnh, bảo vệ giấc ngủ ngon cho người nằm cùng.</p>

        <img src="https://file.hstatic.net/200000065946/file/iam-dang-ke-ap-luc-len-cac-khop-xuong_27a13f63a9014b718cd19a6a33f758de_grande.jpg" alt="Giảm đáng kể áp lực lên các khớp xương">
        <h3>5. Nệm Foam hoạt tính mang lại lợi ích gì cho người hay bị đau cơ khớp?</h3>
        <p>Nệm Memory Foam (Foam hoạt tính) có khả năng ôm sát theo từng đường cong cơ thể dựa trên nhiệt độ và trọng lượng. Cơ chế này giúp gia tăng diện tích tiếp xúc, từ đó giảm áp lực đè nén lên các điểm chịu lực chính như vai, hông và gót chân. Đây là giải pháp y tế tuyệt vời giúp thúc đẩy tuần hoàn máu tốt hơn, mang lại cảm giác nhẹ nhàng, thư thái tuyệt đối.</p>
    '
WHERE id = 4;


-- 5
UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/sam-noi-that-thang-7-am_05b9e647c56e4f308aafea72ed3ad916_1024x1024.jpg',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/sam-noi-that-thang-7-am_05b9e647c56e4f308aafea72ed3ad916_1024x1024.jpg" alt="Sắm nội thất tháng 7 âm lịch">
        <h3>1. Có nên mua sắm nội thất vào tháng 7 âm lịch (Tháng Cô Hồn) hay không?</h3>
        <p>Theo quan niệm dân gian, tháng 7 âm lịch thường là thời điểm hạn chế mua sắm đồ lớn hay động thổ vì sợ gặp xui xẻo. Tuy nhiên, dưới góc nhìn hiện đại và kinh tế, đây lại là "thời điểm vàng" để mua sắm nội thất. Việc kiêng kỵ chủ yếu nằm ở tâm lý, nếu bạn chỉ mua mới giường, tủ, sofa để thay thế đồ cũ hoặc tân trang nhà cửa thì hoàn toàn không ảnh hưởng, ngược lại còn mang ý nghĩa đổi mới sinh khí.</p>

        <img src="https://file.hstatic.net/200000065946/file/sam-noi-that-thang-7-am_9d91e0147f09407295df918cb4a3c1dc_grande.jpg" alt="Chương trình ưu đãi nội thất tháng 7">
        <h3>2. Tại sao mua nội thất vào thời điểm này lại giúp tiết kiệm chi phí tối đa?</h3>
        <p>Do tâm lý e ngại chung của thị trường, các thương hiệu nội thất lớn thường tung ra những chương trình khuyến mãi, giảm giá sâu nhất trong năm vào tháng 7 âm lịch nhằm kích cầu mua sắm. Đây là cơ hội hiếm có để bạn sở hữu các sản phẩm cao cấp, chính hãng với mức giá "hời" hơn từ 20% đến 30% so với mùa cao điểm cuối năm.</p>

        <img src="https://file.hstatic.net/200000065946/file/sam-noi-that-thang-7-am_6d81fcccfdfe4f49903c271ab07b5f52_grande.jpg" alt="Dịch vụ giao hàng chu đáo ngày thấp điểm">
        <h3>3. Lợi ích về mặt dịch vụ và vận chuyển khi mua đồ nội thất mùa thấp điểm?</h3>
        <p>Vào các tháng cao điểm như sát Tết, tình trạng quá tải đơn hàng thường khiến việc giao hàng bị chậm trễ, lắp đặt vội vã. Ngược lại, mua hàng vào tháng 7 âm lịch giúp bạn nhận được sự chăm sóc chu đáo nhất. Đội ngũ giao hàng và kỹ thuật viên lắp ráp có nhiều thời gian để hoàn thiện sản phẩm tại nhà bạn một cách tỉ mỉ, cẩn thận và đúng hẹn tuyệt đối.</p>

        <img src="https://file.hstatic.net/200000065946/file/sam-noi-that-thang-7-am_9b983b01fde54e648ce3b8f6873b09c1_grande.jpg" alt="Chọn nội thất màu sắc tươi sáng">
        <h3>4. Nên ưu tiên chọn nội thất có màu sắc thế nào để xua tan cảm giác ảm đạm?</h3>
        <p>Để tăng cường năng lượng tích cực và mang lại cảm giác ấm cúng, tươi mới cho ngôi nhà trong tháng Vu Lan, bạn nên ưu tiên chọn các món nội thất gỗ màu sáng tự nhiên (như màu gỗ Sồi - Oak), kết hợp vải bọc sofa hoặc chăn ga gối màu kem, xám nhạt hoặc pastel. Những gam màu này giúp không gian sáng sủa, tạo tâm lý thư thái, an yên cho các thành viên.</p>

        <img src="https://file.hstatic.net/200000065946/file/sam-noi-that-thang-7-am_16271b9c3000468dbebcb61120b86863_grande.jpg" alt="Mẹo hóa giải tâm lý khi mua đồ tháng 7">
        <h3>5. Mẹo nhỏ giúp bạn an tâm tuyệt đối khi nhận đồ nội thất trong tháng này?</h3>
        <p>Nếu vẫn còn một chút lo lắng về mặt tâm linh, bạn hoàn toàn có thể áp dụng mẹo "đặt hàng trước, nhận hàng sau". Bạn tận dụng các chương trình ưu đãi lớn trong tháng 7 để chốt đơn giữ giá tốt, sau đó hẹn lịch giao hàng và lắp đặt sang đầu tháng 8 âm lịch. Cách làm thông minh này vừa giúp bạn tiết kiệm ngân sách, vừa đảm bảo sự an tâm và thoải mái tối đa về mặt tâm lý.</p>
    '
WHERE id = 5;


-- 6
UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/bao-gia-ke-tivi-go-cong-nghiep_05bb31c5e8ff4daf8fa168b90b948402_1024x1024.jpg',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/bao-gia-ke-tivi-go-cong-nghiep_05bb31c5e8ff4daf8fa168b90b948402_1024x1024.jpg" alt="Báo giá kệ tivi gỗ công nghiệp hiện đại">
        <h3>1. Tại sao kệ tivi gỗ công nghiệp lại trở thành xu hướng hàng đầu hiện nay?</h3>
        <p>So với gỗ tự nhiên, kệ tivi làm từ gỗ công nghiệp (như MDF, HDF cao cấp) sở hữu những ưu điểm vượt trội phù hợp với lối sống hiện đại: không bị cong vênh, co ngót do thời tiết, khả năng chống mối mọt tốt và đặc biệt là kiểu dáng phẳng thẳng, màu sắc cực kỳ đa dạng từ vân gỗ trầm ấm đến các tone màu hiện đại như trắng, xám nhạt.</p>

        <img src="https://file.hstatic.net/200000065946/file/bao-gia-ke-tivi-go-cong-nghiep_9011c5bec1bd4e4e915a84427cf4f9cd_grande.jpg" alt="Các yếu tố ảnh hưởng giá kệ tivi">
        <h3>2. Những yếu tố nào quyết định đến mức giá của một chiếc kệ tivi?</h3>
        <p>Giá thành của kệ tivi gỗ công nghiệp phụ thuộc chủ yếu vào 3 yếu tố: cốt gỗ bên trong (MDF thường hay MDF lõi xanh chống ẩm), lớp bề mặt phủ bên ngoài (Melamine, Veneer hay sơn bệt) và hệ phụ kiện đi kèm (bản lề giảm chấn, ray trượt ngăn kéo). Việc lựa chọn đúng phân khúc sẽ giúp bạn sở hữu sản phẩm bền bỉ mà vẫn tối ưu chi phí.</p>

        <img src="https://file.hstatic.net/200000065946/file/bao-gia-ke-tivi-go-cong-nghiep_e9517d816e0d4ac78d93911347ff6aaa_grande.jpg" alt="Kệ tivi phòng khách thông minh">
        <h3>3. Nên chọn kệ tivi chân cao hay kệ tivi bệt áp sàn cho phòng khách chung cư?</h3>
        <p>Đối với không gian chung cư vừa và nhỏ, các mẫu kệ tivi chân cao bằng gỗ hoặc kim loại là sự lựa chọn hoàn hảo vì giúp để lộ khoảng sàn, tạo cảm giác không gian rộng rãi và robot hút bụi dễ dàng quét dọn. Trong khi đó, kệ tivi bệt áp sàn lại mang đến vẻ đẹp bề thế, vững chãi và cung cấp sức chứa lưu trữ đồ đạc lớn hơn.</p>

        <img src="https://file.hstatic.net/200000065946/file/bao-gia-ke-tivi-go-cong-nghiep_cf8c09da6c364ba39b53b9b9d52bd1f1_grande.jpg" alt="Kích thước kệ tivi tiêu chuẩn">
        <h3>4. Kích thước kệ tivi tiêu chuẩn rộng bao nhiêu để phù hợp với các dòng tivi hiện nay?</h3>
        <p>Một chiếc kệ tivi đẹp cần có chiều dài lớn hơn chiều rộng của tivi từ 20cm đến 30cm mỗi bên để tạo sự cân đối thị giác và có góc decor trang trí. Thông thường, với tivi từ 55 inch đến 65 inch, các kích thước kệ tivi dài 1m6, 1m8 hoặc 2m là những thông số tiêu chuẩn được lựa chọn nhiều nhất tại các căn hộ hiện đại.</p>

        <img src="https://file.hstatic.net/200000065946/file/bao-gia-ke-tivi-go-cong-nghiep_d76a971e97f24f1d889e3a9bf47e9b35_grande.jpg" alt="Mẹo bố trí kệ tivi gọn gàng">
        <h3>5. Làm thế nào để sắp xếp kệ tivi luôn gọn gàng, tăng tính thẩm mỹ?</h3>
        <p>Hãy tận dụng các ngăn kéo kín để giấu đi các phụ kiện dây điện rườm rà, cục router wifi hoặc đầu đĩa. Trên mặt kệ, tuân thủ nguyên tắc bài trí "ít nhưng chất": chỉ nên đặt tivi làm trung tâm, một bên bố trí chậu cây thủy sinh nhỏ hoặc lọ hoa khô nghệ thuật, bên còn lại đặt vài cuốn sách tạp chí để tạo điểm nhấn nhẹ nhàng cho căn phòng.</p>
    '
WHERE id = 6;


UPDATE posts 
SET 
    thumbnail = 'https://cdn.hstatic.net/files/200000065946/article/mau-ban-an-gia-re-can-tho-hien-dai_54d6d3afb10e473a8d9e45d2a1e88956_1024x1024.jpg',
    content = '
        <img src="https://cdn.hstatic.net/files/200000065946/article/mau-ban-an-gia-re-can-tho-hien-dai_54d6d3afb10e473a8d9e45d2a1e88956_1024x1024.jpg" alt="Mẫu bàn ăn giá rẻ Cần Thơ hiện đại">
        <h3>1. Sự kiện khai trương không gian mua sắm nội thất MOHO tại Ninh Kiều - Cần Thơ có gì hot?</h3>
        <p>Nhằm mang đến những trải nghiệm mua sắm nội thất chuẩn quốc tế cho khách hàng vùng sông nước, sự kiện ra mắt không gian trưng bày mới tại trung tâm quận Ninh Kiều đã chính thức diễn ra. Tại đây, khách hàng không chỉ được chiêm ngưỡng các bộ sưu tập nội thất mới nhất mà còn nhận được hàng loạt voucher mua sắm và quà tặng check-in cực kỳ hấp dẫn.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/wroom-noi-that-moho-ninh-kieu-can-tho_c1fc35e3674f4260b36f1f2e9ebc3cbc_1024x1024.jpg" alt="Showroom nội thất MOHO Ninh Kiều Cần Thơ">
        <h3>2. Khám phá không gian trải nghiệm nội thất thực tế độc đáo tại Tây Đô?</h3>
        <p>Khác biệt với các cửa hàng truyền thống, showroom tại Cần Thơ được bài trí theo dạng các "căn hộ mô phỏng" từ phòng khách, phòng ngủ cho đến phòng ăn. Cách sắp xếp thông minh này giúp khách hàng dễ dàng hình dung được tỷ lệ, kích thước và cách phối màu sắc của sản phẩm khi đặt vào không gian thực tế của gia đình mình.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/wroom-noi-that-moho-ninh-kieu-can-tho_688ac62e9c594d8bb7da1fb8aaec9f17_1024x1024.jpg" alt="Các mẫu sofa giường trưng bày tại Cần Thơ">
        <h3>3. Ưu đãi độc quyền nào dành riêng cho khách hàng tham quan sắm sửa dịp khai trương?</h3>
        <p>Mừng ưu đãi giảm giá sâu toàn bộ sản phẩm hiện có mặt tại cửa hàng, đây là cơ hội lớn nhất năm để các gia đình thay mới diện mạo nhà cửa. Bên cạnh chương trình giảm giá trực tiếp trên hóa đơn, khách hàng còn được áp dụng chính sách trả góp 0% lãi suất, giúp giảm nhẹ gánh nặng tài chính khi sắm sửa trọn gói.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/wroom-noi-that-moho-ninh-kieu-can-tho_381832ac68164beeb6f9bc1814f21cee_1024x1024.jpg" alt="Tư vấn thiết kế nội thất tại chỗ">
        <h3>4. Đội ngũ chuyên viên tư vấn hỗ trợ gì cho khách hàng tại sự kiện?</h3>
        <p>Khi đến tham quan trực tiếp, khách hàng chỉ cần mang theo bản vẽ sơ đồ nhà hoặc hình ảnh phòng ốc hiện tại. Đội ngũ tư vấn viên chuyên nghiệp tại showroom sẽ hỗ trợ tư vấn hoàn toàn miễn phí cách lựa chọn kiểu dáng, kích thước giường tủ sao cho vừa vặn phong thủy và tối ưu công năng sử dụng tốt nhất.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/wroom-noi-that-moho-ninh-kieu-can-tho_cbe326ffeec749c0af65545ff2d78c3a_1024x1024.jpg" alt="Chính sách giao hàng lắp đặt miễn phí tại Cần Thơ">
        <h3>5. Chính sách vận chuyển và bảo hành dành cho khu vực miền Tây được áp dụng ra sao?</h3>
        <p>Để hỗ trợ tối đa cho bà con khu vực Cần Thơ và các tỉnh lân cận, chúng tôi triển khai chính sách miễn phí giao hàng và lắp đặt tận nhà cho các đơn hàng đáp ứng điều kiện tiêu chuẩn. Tất cả sản phẩm nội thất chính hãng đều được áp dụng chế độ bảo hành lên tới 2 năm cho phần khung gỗ và bảo trì trọn đời, mang lại sự an tâm tuyệt đối.</p>
    '
WHERE id = 7;

-- 8

UPDATE posts 
SET 
    thumbnail = 'https://cdn.hstatic.net/files/200000065946/article/top_mau_tu_quan_ao_cua_lua_dcb4702486e84266b73c541590aa2599_1024x1024.jpg',
    content = '
        <img src="https://cdn.hstatic.net/files/200000065946/article/top_mau_tu_quan_ao_cua_lua_dcb4702486e84266b73c541590aa2599_1024x1024.jpg" alt="Top mẫu tủ quần áo cửa lùa đẹp">
        <h3>1. Khai mạc tuần lễ sự kiện: "Giải pháp phòng ngủ thông minh - Ưu đãi tủ áo cửa lùa"</h3>
        <p>Nhằm mang đến giải pháp tối ưu không gian cho các căn hộ hiện đại, tuần lễ mua sắm chuyên đề phòng ngủ đã chính thức khởi động. Tâm điểm của sự kiện lần này là các dòng sản phẩm tủ quần áo thiết kế cửa lùa (cửa trượt) thế hệ mới, giúp giải phóng diện tích tối đa cho những căn phòng có khoảng cách từ giường ngủ đến tủ áo quá hẹp.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-tu-quan-ao-cua-lua-dep_0a7853926fcd4847bc53c49aa70af940_grande.jpg" alt="Tủ quần áo cửa lùa gỗ công nghiệp cao cấp">
        <h3>2. Ưu điểm vượt trội của cơ chế cửa lùa trượt êm ái là gì?</h3>
        <p>Khác với tủ mở cánh truyền thống cần một khoảng trống lớn để mở cửa, tủ cửa lùa vận hành dựa trên hệ thống ray trượt giảm chấn cao cấp. Khi mở tủ, cánh cửa sẽ trượt mượt mà sang hai bên, hoàn toàn không chiếm dụng một phân khối không gian nào phía trước, giúp bạn thoải mái đi lại hoặc đặt tab đầu giường ngay sát cạnh tủ.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-tu-quan-ao-cua-lua-dep_0ef2d83fde6847008760c679048dd29f_grande.jpg" alt="Cấu trúc bên trong tủ áo thông minh">
        <h3>3. Thiết kế ngăn lưu trữ bên trong tủ được tối ưu hóa như thế nào?</h3>
        <p>Các dòng tủ áo tham gia chương trình ưu đãi lần này đều được nghiên cứu kỹ lưỡng về thói quen sinh hoạt của người Việt. Hệ ngăn kệ được phân chia khoa học bao gồm: khoang treo đại phục (váy dài, comple), ngăn kéo khóa bảo mật đồ cá nhân, và các hộc tủ lớn phía trên cùng để cất giữ chăn ga gối đệm mùa đông một cách ngăn nắp.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-tu-quan-ao-cua-lua-dep_d77a2b2cd1b44b92a2cad63036c3fb6f_grande.jpg" alt="Chất liệu tủ áo chuẩn sinh thái an toàn">
        <h3>4. Chất liệu gỗ công nghiệp cao cấp đạt tiêu chuẩn quốc tế an toàn sức khỏe?</h3>
        <p>Tất cả sản phẩm tủ quần áo của chúng tôi đều được chế tác từ gỗ công nghiệp cao cấp phủ Melamine chống trầy xước, chống ẩm mốc vượt trội. Đặc biệt, cốt gỗ đạt chứng nhận CARB-P2 (tiêu chuẩn Mỹ), kiểm soát nghiêm ngặt hàm lượng phát thải formaldehyde, đảm bảo tuyệt đối an toàn cho hệ hô hấp của gia đình, nhất là trong không gian kín của phòng ngủ.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-tu-quan-ao-cua-lua-dep_d77a2b2cd1b44b92a2cad63036c3fb6f_grande.jpg" alt="Thông tin khuyến mãi tuần lễ vàng">
        <h3>5. Thông tin chi tiết về mức giảm giá và quà tặng tặng kèm khi chốt đơn?</h3>
        <p>Trong suốt thời gian diễn ra sự kiện, các mẫu tủ quần áo cửa lùa sẽ được áp dụng mức giảm giá trực tiếp lên đến 25%. Ngoài ra, khi mua kèm combo Giường ngủ hoặc Bàn trang điểm, quý khách hàng sẽ được tặng ngay một bộ gối nằm cao cấp và được hưởng đặc quyền miễn phí vận chuyển, lắp đặt tận phòng tại nội thành.</p>
    '
WHERE id = 8;


-- 9
UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/sam-noi-that-thang-7-am_05b9e647c56e4f308aafea72ed3ad916_1024x1024.jpg',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/sam-noi-that-thang-7-am_05b9e647c56e4f308aafea72ed3ad916_1024x1024.jpg" alt="Săn ưu đãi nội thất tháng 7 âm lịch">
        <h3>1. Bùng nổ sự kiện: "Xả kho chuyên đề - Sắm trọn nội thất phòng ngủ giá cực hời"</h3>
        <p>Để tiếp nối chuỗi sự kiện kích cầu mua sắm mùa thấp điểm, chiến dịch tổng xả kho nội thất phòng ngủ lớn nhất giai đoạn giữa năm đã chính thức được kích hoạt. Đây là cơ hội có một không hai để các gia đình đang trong giai đoạn hoàn thiện nhà cửa sắm sửa được những sản phẩm chính hãng, chất lượng xuất khẩu với mức ngân sách tiết kiệm tối đa.</p>

        <img src="https://file.hstatic.net/200000065946/file/sam-noi-that-thang-7-am_9d91e0147f09407295df918cb4a3c1dc_grande.jpg" alt="Không gian phòng ngủ đồng bộ">
        <h3>2. Tại sao nên chọn mua combo nội thất phòng ngủ đồng bộ tại sự kiện này?</h3>
        <p>Việc mua lẻ tẻ từng món nội thất thường khiến phòng ngủ dễ bị lệch tông và tiêu tốn nhiều chi phí vận chuyển. Tại sự kiện xả kho lần này, chúng tôi mang đến các gói combo phòng ngủ đồng bộ từ giường ngủ, tủ quần áo cho đến tab đầu giường. Mua theo gói giúp không gian đạt được sự nhất quán hoàn hảo về thẩm mỹ và nhận mức chiết khấu kép cực sâu.</p>

        <img src="https://file.hstatic.net/200000065946/file/sam-noi-that-thang-7-am_6d81fcccfdfe4f49903c271ab07b5f52_grande.jpg" alt="Tư vấn chọn nội thất chuẩn kích thước">
        <h3>3. Làm thế nào để chọn được tủ quần áo có kích thước chuẩn với diện tích phòng?</h3>
        <p>Trước khi quyết định chốt đơn dòng tủ thanh lý, bạn cần đo đạc kỹ góc tường đặt tủ cũng như chiều cao trần nhà. Đối với phòng ngủ chung cư có diện tích từ 10m2 đến 12m2, các mẫu tủ quần áo 2 cánh hoặc 3 cánh với chiều rộng khoảng 1m4 đến 1m6 là lựa chọn vừa vặn nhất, giúp đảm bảo sức chứa mà không làm phòng bị ngột ngạt.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-tu-quan-ao-cua-lua-dep_c7777b541e5847e0a3ad8aaf41cc0891_grande.jpg" alt="Mẫu tủ quần áo cửa lùa vân gỗ sồi">
        <h3>4. Điểm nhấn từ dòng tủ quần áo cửa lùa vân gỗ sồi tự nhiên trong danh mục xả kho?</h3>
        <p>Nổi bật trong danh sách sản phẩm ưu đãi lần này là các thiết kế tủ quần áo cửa lùa sở hữu tone màu gỗ sồi tự nhiên vô cùng tinh tế. Lớp phủ bề mặt Melamine cao cấp không chỉ giúp tái hiện trọn vẹn những đường vân gỗ uyển chuyển, sang trọng mà còn bảo vệ tủ khỏi các tác động trầy xước và chống thấm bề mặt hiệu quả trong suốt quá trình sử dụng.</p>

        <img src="https://cdn.hstatic.net/200000065946/file/mau-tu-quan-ao-cua-lua-dep_659539e7652d416bb8d676cc720197b6_grande.jpg" alt="Chính sách cam kết chất lượng hàng xả kho">
        <h3>5. Hàng xả kho giá rẻ liệu có được cam kết đầy đủ về chính sách bảo hành?</h3>
        <p>Chúng tôi cam kết toàn bộ sản phẩm trong sự kiện xả hàng đều là hàng mới 100% chính hãng, chỉ được giảm giá để giải phóng mặt bằng kho bãi. Do đó, quý khách hàng vẫn được hưởng trọn vẹn chính sách dịch vụ chuẩn mực: bảo hành 2 năm lỗi kỹ thuật, bảo trì trọn đời và hỗ trợ lắp đặt tận nơi từ đội ngũ kỹ thuật viên chuyên nghiệp.</p>
    '
WHERE id = 9;

-- 10
UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/g-va-phuc-loi-nu-cong-nhan-tai-noi-that-moho-nhan-ngay-phu-nu-viet-nam_e2f6e9519636405f9d7fedae79c96dbc_1024x1024.jpg',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/g-va-phuc-loi-nu-cong-nhan-tai-noi-that-moho-nhan-ngay-phu-nu-viet-nam_e2f6e9519636405f9d7fedae79c96dbc_1024x1024.jpg" alt="Chế độ và phúc lợi tại Nội Thất MOHO">
        <h3>1. Review thực tế: Giá trị cốt lõi đằng sau một thương hiệu nội thất chuẩn xuất khẩu?</h3>
        <p>Khi lựa chọn nội thất, người tiêu dùng thường chỉ chú ý đến kiểu dáng và giá cả. Tuy nhiên, một sản phẩm có độ hoàn thiện cao và bền bỉ chỉ có thể được tạo ra từ một môi trường làm việc nhân văn. Bài viết hôm nay sẽ mang đến một góc nhìn review thực tế về quy trình vận hành và văn hóa doanh nghiệp – nơi những người thợ lành nghề được đảm bảo phúc lợi trọn vẹn để an tâm kiến tạo không gian sống cho khách hàng.</p>

        <img src="https://file.hstatic.net/200000065946/file/va-phuc-loi-nu-cong-nhan-tai-noi-that-moho-nhan-ngay-phu-nu-viet-nam-1_dccfe33e79044c00bccd9bbb7d138c8f.jpg" alt="Tôn vinh lao động nữ tại nhà máy nội thất">
        <h3>2. Vai trò của những "bóng hồng" trong dây chuyền sản xuất cơ khí và đồ gỗ?</h3>
        <p>Tại nhà máy sản xuất hiện đại, quy trình kiểm định chất lượng bề mặt phủ, may bọc nệm sofa hay đóng gói chi tiết nhỏ luôn đòi hỏi sự tỉ mỉ, khéo léo tối đa. Đội ngũ nhân sự nữ tại đây đóng vai trò như những "người gác cổng" nghiêm ngặt, đảm bảo mỗi tấm gỗ, mỗi đường kim mũi chỉ trước khi rời xưởng đều đạt tiêu chuẩn xuất khẩu quốc tế khắt khe.</p>

        <img src="https://file.hstatic.net/200000065946/file/va-phuc-loi-nu-cong-nhan-tai-noi-that-moho-nhan-ngay-phu-nu-viet-nam-2_58c0a9301bf34ff1955e206b81000981.jpg" alt="Chăm lo đời sống tinh thần công nhân viên">
        <h3>3. Các hoạt động tri ân và chế độ đãi ngộ có tác động thế nào đến chất lượng sản phẩm?</h3>
        <p>Việc thường xuyên tổ chức các hoạt động tri ân, chăm lo đời sống tinh thần và sức khỏe cho người lao động vào các dịp lễ lớn không chỉ là trách nhiệm xã hội, mà còn là bí quyết giữ chân nhân tài. Khi người thợ cảm thấy công sức của mình được tôn trọng và đãi ngộ xứng đáng, họ sẽ gửi gắm sự tâm huyết đó vào từng sản phẩm, giúp hạn chế tối đa các lỗi kỹ thuật nhỏ nhất.</p>

        <img src="https://file.hstatic.net/200000065946/file/va-phuc-loi-nu-cong-nhan-tai-noi-that-moho-nhan-ngay-phu-nu-viet-nam-1_396f5b9cf38340d6a48d02d1ccbdc00d.jpg" alt="Đào tạo kỹ năng tay nghề định kỳ">
        <h3>4. Quy trình đào tạo an toàn và nâng cao tay nghề định kỳ chuẩn quốc tế?</h3>
        <p>Để vận hành mượt mà hệ thống máy móc CNC tự động hóa, công nhân liên tục được tham gia các khóa đào tạo chuyên sâu về kỹ thuật và an toàn lao động. Sự đầu tư bài bản về mặt con người này giúp nâng cao năng suất, đồng thời đảm bảo chất lượng thành phẩm đồng đều 100% khi sản xuất hàng loạt, đáp ứng hoàn hảo tiến độ của các dự án lớn.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi-that-moho-doi-ngu-giao-hang-va-lap-dat-tan-tam-chuyen-nghiep_2__7c94e206bd6c4386840630f998889108_grande.png" alt="Đội ngũ giao hàng lắp đặt MOHO tận tâm">
        <h3>5. Đánh giá chất lượng dịch vụ giao hàng và lắp đặt tận nhà từ phía người dùng?</h3>
        <p>Mắt xích cuối cùng chạm đến trải nghiệm của khách hàng chính là đội ngũ shipper và kỹ thuật viên lắp đặt nội bộ. Được đào tạo bài bản với tinh thần "tận tâm - chuyên nghiệp", đội ngũ này không chỉ vận chuyển an toàn, lắp ráp chuẩn xác theo đúng sơ đồ kỹ thuật mà còn dọn dẹp vệ sinh sạch sẽ khu vực thi công trước khi bàn giao, mang lại sự hài lòng tuyệt đối cho gia chủ.</p>
    '
WHERE id = 10;


-- 11
UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/iam-doc-thiet-ke-cua-moho-nguoi-ve-len-nhung-y-tuong-thiet-ke-noi-that_df8396158f464b8fbf9f1be0a1b31bfe_1024x1024.png',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/iam-doc-thiet-ke-cua-moho-nguoi-ve-len-nhung-y-tuong-thiet-ke-noi-that_df8396158f464b8fbf9f1be0a1b31bfe_1024x1024.png" alt="Giám đốc thiết kế MOHO - Người vẽ ý tưởng nội thất">
        <h3>1. Ý tưởng thiết kế nội thất đương đại bắt nguồn từ câu chuyện cốt lõi nào?</h3>
        <p>Phía sau mỗi sản phẩm nội thất tinh tế không đơn thuần là quá trình sản xuất cơ khí, mà là cả một hành trình sáng tạo đầy nghệ thuật. Gặp gỡ Giám đốc thiết kế của thương hiệu – người chịu trách nhiệm "thổi hồn" vào từng bản vẽ, chúng ta sẽ cùng khám phá cách các xu hướng kiến trúc phương Tây được dung hòa khéo léo với thói quen sinh hoạt và văn hóa của người Việt để tạo ra những không gian sống đậm chất đương đại.</p>

        <img src="https://file.hstatic.net/200000065946/file/ke-cua-moho-nguoi-ve-len-nhung-y-tuong-thiet-ke-noi-that_1_-compressed_7569d4e30858427d9ec40b612aeda764_grande.jpg" alt="Phác thảo ý tưởng thiết kế nội thất">
        <h3>2. Quy trình phác thảo ý tưởng từ bản vẽ tay đến mô hình 3D thực tế?</h3>
        <p>Mỗi chiếc bàn, chiếc ghế trước khi đưa vào dây chuyền sản xuất hàng loạt đều phải trải qua hàng trăm giờ nghiên cứu. Từ những nét phác thảo sơ khai trên giấy để định hình tỷ lệ cân đối, đội ngũ thiết kế sẽ số hóa thành các mô hình kỹ thuật dựng 3D, tính toán kỹ lưỡng từng góc bo tròn, độ nghiêng của tựa lưng nhằm tối ưu hóa công năng và mang lại trải nghiệm công thái học tốt nhất cho người sử dụng.</p>

        <img src="https://file.hstatic.net/200000065946/file/ke-cua-moho-nguoi-ve-len-nhung-y-tuong-thiet-ke-noi-that_3_-compressed_16c265d7e891465899b09d64764554ec_grande.jpg" alt="Lựa chọn chất liệu và màu sắc">
        <h3>3. Sự khắt khe trong việc lựa chọn bảng màu và chất liệu chuẩn quốc tế?</h3>
        <p>Tư duy thiết kế hiện đại luôn đi đôi với trách nhiệm sinh thái. Nhà thiết kế luôn ưu tiên những chất liệu có nguồn gốc rõ ràng như gỗ tự nhiên đạt chứng nhận FSC về quản lý rừng bền vững, kết hợp với các dải màu trung tính như màu gỗ sồi tự nhiên, màu kem ấm hay xám thanh lịch. Sự kết hợp này mang lại cảm giác bình yên, trường tồn và dễ dàng phối hợp với nhiều phong cách nhà ở khác nhau.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi-that-moho-anh-wyline_c506b4f0038148d0a427a30f93466af5_2048x2048.png" alt="Bộ sưu tập nội thất Wyline hiện đại">
        <h3>4. Đột phá không gian với nguồn cảm hứng từ Bộ sưu tập Wyline?</h3>
        <p>Review chi tiết bộ sưu tập Wyline – một trong những biểu tượng thiết kế mang dấu ấn đậm nét của vị Giám đốc sáng tạo. Wyline sở hữu các đường nét thanh mảnh nhưng vô cùng vững chãi, loại bỏ hoàn toàn các chi tiết rườm rà để tôn vinh vẻ đẹp mộc mạc của thớ gỗ. Bộ sưu tập bao gồm trọn gói giải pháp cho phòng khách và phòng ăn, mang lại sự đồng điệu, sang trọng cho toàn bộ ngôi nhà.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi-that-moho-anh-wyline-01_92f1b20f105949339f49df396708c353_2048x2048.png" alt="Góc bài trí phòng ăn Wyline tinh tế">
        <h3>5. Lời khuyên của chuyên gia thiết kế khi bài trí không gian sống tối giản?</h3>
        <p>Theo chia sẻ từ chuyên gia, tinh thần tối giản (Minimalism) không phải là sự trống trải, mà là sự chắt lọc có chủ đích. Thay vì cố gắng lấp đầy căn phòng bằng quá nhiều đồ decor trang trí, bạn hãy đầu tư vào một vài món nội thất chủ đạo có thiết kế đẹp vượt thời gian giống như hệ sản phẩm Wyline. Hãy để chính khoảng trống và ánh sáng tự nhiên làm nên vẻ đẹp xa xỉ cho ngôi nhà của bạn.</p>
    '
WHERE id = 11;

-- 12

UPDATE posts 
SET 
    thumbnail = 'https://file.hstatic.net/200000065946/article/noi_that_moho_quy_trinh_san_xuat_moho_dat_chuan_moho_e9c5f9a3dc004cc8883de436bace86af_1024x1024.png',
    content = '
        <img src="https://file.hstatic.net/200000065946/article/noi_that_moho_quy_trinh_san_xuat_moho_dat_chuan_moho_e9c5f9a3dc004cc8883de436bace86af_1024x1024.png" alt="Quy trình sản xuất nội thất đạt chuẩn quốc tế">
        <h3>1. Đánh giá tổng quan: Quy trình sản xuất đạt chuẩn quốc tế có gì khác biệt?</h3>
        <p>Để tạo ra một sản phẩm nội thất có tuổi thọ lên đến hàng chục năm, khâu cốt lõi nằm ở dây chuyền sản xuất cơ khí và chế biến gỗ khép kín. Việc đầu tư đồng bộ hệ thống máy móc tự động hóa từ Đức và Ý giúp kiểm soát dung sai kỹ thuật ở mức siêu nhỏ (dưới 0.5mm). Điều này đảm bảo các linh kiện lắp ráp luôn ăn khớp tuyệt đối, mang lại kết cấu bền vững vượt trội so với các phương pháp gia công thủ công truyền thống.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi_that_moho_quy_trinh_san_xuat_moho_dat_chuan_moho_02_149cbb1ca7a94baab6bd9800592bab8a_1024x1024.png" alt="Kiểm tra chất lượng phôi gỗ đầu vào">
        <h3>2. Khâu xử lý phôi gỗ và sấy khô đạt chuẩn xuất khẩu vận hành ra sao?</h3>
        <p>Trước khi đưa vào cắt gọt, toàn bộ phôi gỗ tự nhiên (gỗ cao su, gỗ tràm) đều phải trải qua quy trình tẩm sấy nghiêm ngặt để đưa độ ẩm bên trong thớ gỗ về mức tiêu chuẩn từ 8% đến 12%. Khâu xử lý này cực kỳ quan trọng, giúp triệt tiêu hoàn toàn nguy cơ co ngót, nứt nẻ hoặc cong vênh do tác động của sự thay đổi nhiệt độ đột ngột trong môi trường khí hậu nhiệt đới gió mùa tại Việt Nam.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi_that_moho_go_cong_nghiep_02_df3535b62f144ab4be7c1aba8f057654_grande.png" alt="Bí mật cốt gỗ công nghiệp chuẩn CARB-P2">
        <h3>3. Phân tích cốt gỗ công nghiệp cao cấp: Vì sao sức khỏe của bạn được bảo vệ?</h3>
        <p>Review chi tiết về vật liệu gỗ công nghiệp cao cấp được ứng dụng trong sản xuất tủ áo và kệ tivi. Sản phẩm sử dụng 100% cốt gỗ MDF/MFC chống ẩm đạt chứng nhận CARB-P2 và EPA danh giá của Mỹ. Đây là tiêu chuẩn kiểm soát hàm lượng phát thải khí formaldehyde cực kỳ khắt khe, giúp loại bỏ hoàn toàn mùi hôi nồng khó chịu, đảm bảo không gian sống hoàn toàn trong lành, không gây kích ứng hệ hô hấp cho trẻ nhỏ.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi_that_moho_quy_trinh_san_xuat_moho_dat_chuan_moho_03_5b20ca0690624b28ab0dbd41a7caf63d_grande.png" alt="Quy trình phủ bề mặt chống trầy xước">
        <h3>4. Công nghệ phủ Melamine và Veneer chống thấm bề mặt vượt trội?</h3>
        <p>Bề mặt gỗ sau khi định hình được ép phủ lớp màng bảo vệ Melamine hoặc Veneer gỗ sồi thật dưới áp suất và nhiệt độ cao. Quy trình này tạo ra liên kết phân tử bền vững, giúp bề mặt nội thất có khả năng chống trầy xước từ các va đập sinh hoạt hàng ngày, kháng nước bề mặt nhẹ và ngăn chặn hiệu quả sự xâm nhập của các loại nấm mốc hay vết ố từ thức ăn, trà cà phê.</p>

        <img src="https://file.hstatic.net/200000065946/file/noi_that_moho_quy_trinh_san_xuat_moho_dat_chuan_moho_07_5e84273820544656971ae2b142cc3c36_1024x1024.png" alt="Đóng gói và kiểm định chất lượng cuối cùng">
        <h3>5. Khâu đóng gói phẳng (Flat-pack) thông minh mang lại lợi ích gì cho người tiêu dùng?</h3>
        <p>Mắt xích cuối cùng của quy trình sản xuất là công nghệ đóng gói phẳng thông minh. Từng chi tiết của sản phẩm được bọc màng xốp bảo vệ, xếp gọn gàng vào thùng carton 5 lớp kèm theo bộ ốc vít chuyên dụng và sách hướng dẫn chi tiết. Quy trình đóng gói này không chỉ giảm thiểu tối đa rủi ro trầy xước trong quá trình vận chuyển đường dài mà còn giúp tối ưu diện tích kho bãi, từ đó giảm giá thành sản phẩm khi đến tay người dùng.</p>
    '
WHERE id = 12;