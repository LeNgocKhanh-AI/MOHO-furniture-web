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