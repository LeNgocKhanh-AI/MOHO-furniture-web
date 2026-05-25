USE moho_db;

INSERT INTO administrator
(admin_username, admin_password, admin_firstname, admin_lastname, admin_email, admin_address, admin_phone)
VALUES
('admin1','123456','Admin','One','admin1@gmail.com','Ha Noi','0911111111'),
('admin2','123456','Admin','Two','admin2@gmail.com','Da Nang','0911111112'),
('admin3','123456','Admin','Three','admin3@gmail.com','HCM','0911111113'),
('admin4','123456','Admin','Four','admin4@gmail.com','Hue','0911111114'),
('admin5','123456','Admin','Five','admin5@gmail.com','Can Tho','0911111115');




INSERT INTO category (cat_name, cat_desc)
VALUES
('Sofa','Modern sofa collection'),
('Table','Wooden table collection'),
('Chair','Chair collection'); 




INSERT INTO customer
(customer_username, customer_password, customer_firstname, customer_lastname, customer_email, customer_address, customer_gender, customer_phone)
VALUES
('lam01','123456','Lam','Nguyen','lam01@gmail.com','Ha Noi','Male','0900000001'),
('an02','123456','An','Tran','an02@gmail.com','Da Nang','Female','0900000002'),
('minh03','123456','Minh','Le','minh03@gmail.com','HCM','Male','0900000003'),
('hoa04','123456','Hoa','Pham','hoa04@gmail.com','Can Tho','Female','0900000004'),
('duc05','123456','Duc','Vo','duc05@gmail.com','Hai Phong','Male','0900000005'),
('linh06','123456','Linh','Do','linh06@gmail.com','Hue','Female','0900000006'),
('khanh07','123456','Khanh','Nguyen','khanh07@gmail.com','Ha Noi','Male','0900000007'),
('trang08','123456','Trang','Tran','trang08@gmail.com','Nha Trang','Female','0900000008'),
('viet09','123456','Viet','Pham','viet09@gmail.com','Vung Tau','Male','0900000009'),
('mai10','123456','Mai','Le','mai10@gmail.com','Quang Ninh','Female','0900000010'); 





INSERT INTO product
(product_name, category_id, product_price, product_sale_price, product_sku, product_stock_quantity, product_description)
VALUES

-- ================= SOFA =================
('Ghế sofa Moho Niga',1,12000000,11000000,'SF001',10,'Mang lại cảm giác thoải mái và tận hưởng cho người dùng'),

-- ================= TABLE =================
('Bàn ăn gỗ Coster',2,5000000,4500000,'TB001',10,'Theo thiết kế của ý bàn ăn gỗ Coster mang lại sự sang trọng trong ngôi nhà của bạn'),
('Bàn ăn gỗ Mila',2,4200000,4000000,'TB002',7,'Bàn ăn gỗ Mila là sự kết hợp của đơn và hiện đại mang lại sự thích thú và mớ lạ'),
('Bàn ăn gỗ Serena',2,3500000,3200000,'TB003',15,'Serena là cha đẻ của ngành thiết kế những tác phẩm của ông đều mang lại sự khác lạ mới mẻ'),
('Bàn ăn gỗ tự nhiên',2,2500000,2200000,'TB004',9,'Lấy cảm hứng tù nguyên liệu thiên nhiên và gia công thủ công bàn ăn gỗ tự nhiên mang lại sự chắc chắn và bền vững'),


-- ================= Bench =================
('Tủ kệ TV fija',3,1200000,1000000,'B001',30,'Tủ kệ Tv là thứ không thể thiếu trong mỗi gia đình mà hơn hết Fiji mang lại sự đẳng cấp trong lối sống'),
('Tủ kệ Tv Moho Vline',3,1500000,1300000,'B002',20,'Theo thiết kế Vline tủ kệ TV Moho Vline giúp căn nhà của bạn trở lên nổi bật hơn');
 
INSERT INTO product_image
(product_id, image_url, image_type, display_order)
VALUES

-- ================= GHẾ SOFA MOHO NIGA =================
(1,'/images/products/GheSofaMohoNiga/MohoNiga1.png','main',1),
(1,'/images/products/GheSofaMohoNiga/MohoNiga2.png','sub',2),
(1,'/images/products/GheSofaMohoNiga/MohoNiga3.png','sub',3),
(1,'/images/products/GheSofaMohoNiga/MohoNiga4.png','sub',4),

-- ================= BÀN ĂN GỖ COSTER =================
(2,'/images/products/BanangoCoster/BanangoCoster1.png','main',1),
(2,'/images/products/BanangoCoster/BanangoCoster2.png','sub',2),
(2,'/images/products/BanangoCoster/BanangoCoster3.png','sub',3),
(2,'/images/products/BanangoCoster/BanangoCoster4.png','sub',4),

-- ================= BÀN ĂN GỖ MILA =================
(3,'/images/products/BanangoMila/BanangoMiLa1.png','main',1),
(3,'/images/products/BanangoMila/BanangoMiLa2.png','sub',2),
(3,'/images/products/BanangoMila/BanangoMiLa3.png','sub',3),
(3,'/images/products/BanangoMila/BanangoMiLa4.png','sub',4),

-- ================= BÀN ĂN GỖ SERENA =================
(4,'/images/products/BanangoSeReNa/BanangoSerena1.png','main',1),
(4,'/images/products/BanangoSeReNa/BanangoSerena2.png','sub',2),
(4,'/images/products/BanangoSeReNa/BanangoSerena3.png','sub',3),
(4,'/images/products/BanangoSeReNa/BanangoSerena4.png','sub',4),

-- ================= BÀN ĂN GỖ TỰ NHIÊN =================
(5,'/images/products/Banangotunhien/Banangotunhien1.png','main',1),
(5,'/images/products/Banangotunhien/Banangotunhien2.png','sub',2),
(5,'/images/products/Banangotunhien/Banangotunhien3.png','sub',3),
(5,'/images/products/Banangotunhien/Banangotunhien4.png','sub',4),

-- ================= TỦ KỆ TV FIJI =================
(6,'/images/products/TukeTVMohoFiJi/TukeTvMohoFiJi1.png','main',1),
(6,'/images/products/TukeTVMohoFiJi/TukeTvMohoFiJi2.png','sub',2),
(6,'/images/products/TukeTVMohoFiJi/TukeTvMohoFiJi3.png','sub',3),
(6,'/images/products/TukeTVMohoFiJi/TukeTvMohoFiJi4.png','sub',4),

-- ================= TỦ KỆ TV VLINE =================
(7,'/images/products/TukeTvMohoVline/TukeTvMohoVline1.png','main',1),
(7,'/images/products/TukeTvMohoVline/TukeTvMohoVline2.png','sub',2),
(7,'/images/products/TukeTvMohoVline/TukeTvMohoVline3.png','sub',3),
(7,'/images/products/TukeTvMohoVline/TukeTvMohoVline4.png','sub',4);


INSERT INTO feedback
(customer_id, fullname, email, message, status)
VALUES
(1,'Lam Nguyen','lam01@gmail.com','Great service','read'),
(2,'An Tran','an02@gmail.com','Fast delivery','new'),
(3,'Minh Le','minh03@gmail.com','Good quality','replied'),
(4,'Hoa Pham','hoa04@gmail.com','Affordable price','closed'),
(5,'Duc Vo','duc05@gmail.com','Nice product','new'),
(6,'Linh Do','linh06@gmail.com','Support quickly','read'),
(7,'Khanh Nguyen','khanh07@gmail.com','Very satisfied','closed'),
(8,'Trang Tran','trang08@gmail.com','Will buy again','new'),
(9,'Viet Pham','viet09@gmail.com','Beautiful furniture','read'),
(10,'Mai Le','mai10@gmail.com','Excellent','replied');




INSERT INTO orders
(customer_id, order_date, order_status)
VALUES
(1,'2026-05-01 10:00:00','completed'),
(2,'2026-05-02 11:00:00','pending'),
(3,'2026-05-03 12:00:00','completed'),
(4,'2026-05-04 13:00:00','cancelled'),
(5,'2026-05-05 14:00:00','pending'),
(6,'2026-05-06 15:00:00','completed'),
(7,'2026-05-07 16:00:00','pending'),
(8,'2026-05-08 17:00:00','completed'),
(9,'2026-05-09 18:00:00','pending'),
(10,'2026-05-10 19:00:00','completed');





INSERT INTO order_detail
(order_id, product_id, quantity, unit_price)
VALUES
(1,1,1,11000000),
(1,2,2,4500000),
(1,3,1,4000000),
(4,4,1,3200000),
(5,5,1,2200000),
(6,6,2,1000000),
(7,7,1,1300000);
INSERT INTO product_review
(product_id, customer_id, rating, review_comment, review_image, anonymous)
VALUES

/* ===== SOFA ===== */

(
    1,
    1,
    5,
    'Ghế ngồi rất êm và đẹp',
    '/images/reviews/review1.jpg',
    false
),

(
    1,
    2,
    4,
    'Màu sắc giống ảnh',
    '/images/reviews/review2.jpg',
    true
),

(
    1,
    3,
    5,
    'Đóng gói chắc chắn',
    '/images/reviews/review3.jpg',
    false
),

/* ===== TABLE ===== */

(
    2,
    4,
    5,
    'Bàn cực kỳ chắc chắn',
    '/images/reviews/review4.jpg',
    false
),

(
    2,
    5,
    4,
    'Thiết kế đẹp',
    '/images/reviews/review5.jpg',
    true
),

(
    3,
    6,
    3,
    'Ổn trong tầm giá',
    '/images/reviews/review6.jpg',
    false
),

(
    4,
    7,
    5,
    'Rất sang trọng',
    '/images/reviews/review7.jpg',
    false
),

(
    5,
    8,
    4,
    'Gỗ khá đẹp',
    '/images/reviews/review8.jpg',
    true
),

/* ===== TV CABINET ===== */

(
    6,
    9,
    5,
    'Nhìn hiện đại',
    '/images/reviews/review9.jpg',
    false
),

(
    7,
    10,
    4,
    'Phù hợp phòng khách',
    '/images/reviews/review10.jpg',
    false
);