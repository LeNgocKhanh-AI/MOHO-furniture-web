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

CREATE TABLE product_size (
    size_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size_name VARCHAR(50) NOT NULL,
    extra_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_product_size
    FOREIGN KEY (product_id)
    REFERENCES product(product_id)
    ON DELETE CASCADE
);
INSERT INTO product_size
(product_id, size_name, extra_price, stock_quantity)
VALUES

-- 1. Ghế sofa Moho Niga
(1,'1m6',0,5),
(1,'1m8',1500000,3),
(1,'2m0',3000000,2),

-- 2. Bàn ăn gỗ Coster
(2,'120x80',0,4),
(2,'140x80',1000000,3),
(2,'160x90',2000000,2),

-- 3. Bàn ăn gỗ Mila
(3,'120x80',0,4),
(3,'140x80',1200000,3),
(3,'160x90',2400000,2),

-- 4. Bàn ăn gỗ Serena
(4,'120x80',0,5),
(4,'140x80',1000000,3),
(4,'160x90',2000000,2),

-- 5. Bàn ăn gỗ tự nhiên
(5,'120x80',0,4),
(5,'140x80',1000000,3),
(5,'160x90',2000000,2),

-- 6. Tủ kệ TV Fija
(6,'120cm',0,5),
(6,'160cm',500000,3),
(6,'180cm',1000000,2),

-- 7. Tủ kệ TV Moho Vline
(7,'120cm',0,5),
(7,'160cm',700000,3),
(7,'180cm',1400000,2),

-- 8. Ghế Sofa Gỗ Cao Su Tự Nhiên MOHO VLINE
(8,'180cm',0,5),
(8,'200cm',1500000,3),
(8,'220cm',3000000,2);
-- Thêm 2 cột vào product_size
ALTER TABLE product_size
ADD COLUMN price DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN sale_price DECIMAL(12,2) NULL DEFAULT NULL;

-- Tự động tính giá từ product_price + extra_price
UPDATE product_size ps
JOIN product p ON p.product_id = ps.product_id
SET 
    ps.price = p.product_price + ps.extra_price,
    ps.sale_price = IF(
        p.product_sale_price IS NOT NULL,
        p.product_sale_price + ps.extra_price,
        NULL
    );


ALTER TABLE cart_item
ADD COLUMN size_id INT NULL,
ADD CONSTRAINT fk_cart_size
FOREIGN KEY(size_id)
REFERENCES product_size(size_id);
-- Xóa unique cũ
ALTER TABLE order_detail
DROP INDEX `order_id`;

-- Thêm cột size_id
ALTER TABLE order_detail
ADD COLUMN size_id INT NULL,
ADD CONSTRAINT fk_order_detail_size
    FOREIGN KEY (size_id) REFERENCES product_size(size_id);

-- Thêm unique mới đúng logic
ALTER TABLE order_detail
ADD UNIQUE KEY uq_order_product_size (order_id, product_id, size_id);
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
use moho_db ;
CREATE TABLE product_size (
    size_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size_name VARCHAR(50) NOT NULL,
    extra_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_product_size
    FOREIGN KEY (product_id)
    REFERENCES product(product_id)
    ON DELETE CASCADE
);

ALTER TABLE cart_item
ADD COLUMN size_id INT NULL,
ADD CONSTRAINT fk_cart_size
FOREIGN KEY(size_id)
REFERENCES product_size(size_id);   
