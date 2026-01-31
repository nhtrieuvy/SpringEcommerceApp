-- Demo seed data (no user creation)
-- Assumes users already exist: 'seller' and 'user'

USE ecommercedb;

-- Categories
INSERT INTO categories (name, description) VALUES
  ('Điện tử', 'Điện thoại, laptop, phụ kiện'),
  ('Thời trang', 'Quần áo, giày dép, phụ kiện'),
  ('Nhà cửa', 'Đồ gia dụng, nội thất'),
  ('Sức khỏe', 'Chăm sóc cá nhân, thiết bị y tế'),
  ('Thể thao', 'Dụng cụ và trang phục thể thao')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Stores (seller_id may be NULL if seller user not found)
INSERT INTO stores (name, description, address, logo, active, created_date, seller_id)
VALUES
  ('Tech Store', 'Chuyên đồ công nghệ chính hãng', '123 Tech Street', NULL, 1, NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ('Fashion Hub', 'Thời trang trẻ trung, năng động', '45 Style Avenue', NULL, 1, NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ('Home Plus', 'Đồ gia dụng tiện ích', '88 Home Road', NULL, 1, NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1));

-- Products
INSERT INTO products (name, description, price, quantity, image, active, store_id, category_id)
VALUES
  ('Smartphone X', 'Màn hình OLED, chip mạnh mẽ', 899.99, 50, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store' LIMIT 1),
   (SELECT id FROM categories WHERE name='Điện tử' LIMIT 1)),
  ('Laptop Pro 14"', 'Laptop hiệu năng cao', 1299.00, 20, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store' LIMIT 1),
   (SELECT id FROM categories WHERE name='Điện tử' LIMIT 1)),
  ('Tai nghe ANC', 'Chống ồn chủ động', 199.00, 80, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store' LIMIT 1),
   (SELECT id FROM categories WHERE name='Điện tử' LIMIT 1)),
  ('Áo thun Basic', 'Cotton 100% thoáng mát', 19.99, 200, NULL, 1,
   (SELECT id FROM stores WHERE name='Fashion Hub' LIMIT 1),
   (SELECT id FROM categories WHERE name='Thời trang' LIMIT 1)),
  ('Giày Sneaker', 'Thiết kế hiện đại', 59.99, 120, NULL, 1,
   (SELECT id FROM stores WHERE name='Fashion Hub' LIMIT 1),
   (SELECT id FROM categories WHERE name='Thời trang' LIMIT 1)),
  ('Bộ nồi Inox', 'Dày dặn, bền bỉ', 89.99, 60, NULL, 1,
   (SELECT id FROM stores WHERE name='Home Plus' LIMIT 1),
   (SELECT id FROM categories WHERE name='Nhà cửa' LIMIT 1)),
  ('Máy xay sinh tố', 'Công suất 600W', 49.99, 90, NULL, 1,
   (SELECT id FROM stores WHERE name='Home Plus' LIMIT 1),
   (SELECT id FROM categories WHERE name='Nhà cửa' LIMIT 1));

-- Orders (user_id from existing user 'user')
INSERT INTO orders (user_id, order_date, status, total_amount, shipping_fee, address, shipping_address, phone_number, notes)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 919.98, 5.00, '123 Main St', '123 Main St', '0900000004', 'Giao giờ hành chính'),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 139.98, 3.00, '456 Second St', '456 Second St', '0900000004', 'Gọi trước khi giao');

-- Order details
INSERT INTO order_details (order_id, product_id, quantity, price)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), (SELECT id FROM products WHERE name='Smartphone X' LIMIT 1), 1, 899.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), (SELECT id FROM products WHERE name='Áo thun Basic' LIMIT 1), 1, 19.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), (SELECT id FROM products WHERE name='Giày Sneaker' LIMIT 1), 2, 59.99);

-- Payments
INSERT INTO payments (order_id, payment_method, amount, status, transaction_id, payment_date)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), 'PAYPAL', 919.98, 'COMPLETED', 'TXN-1001', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), 'CASH_ON_DELIVERY', 139.98, 'PENDING', 'COD-2001', NOW());

-- Order status history
INSERT INTO order_status_history (order_id, status, note, created_at, created_by)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1));

-- Cart items
INSERT INTO cart_item (user_id, product_id, quantity)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Laptop Pro 14"' LIMIT 1), 1);

-- Wishlist items
INSERT INTO wishlist_item (user_id, product_id)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1));

-- Reviews
INSERT INTO review_products (user_id, product_id, rating, comment, created_at)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Smartphone X' LIMIT 1), 5, 'Sản phẩm rất tốt!', NOW());

INSERT INTO review_replies (review_id, user_id, comment, created_at)
VALUES
  ((SELECT id FROM review_products ORDER BY id DESC LIMIT 1), (SELECT id FROM users WHERE username='seller' LIMIT 1), 'Cảm ơn bạn đã ủng hộ!', NOW());

-- Additional demo orders (10 more)
INSERT INTO orders (user_id, order_date, status, total_amount, shipping_fee, address, shipping_address, phone_number, notes)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 1099.00, 5.00, '12 Nguyen Trai', '12 Nguyen Trai', '0900000004', 'Giao giờ hành chính'),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 79.98, 3.00, '34 Hai Ba Trung', '34 Hai Ba Trung', '0900000004', 'Gọi trước khi giao'),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'SHIPPING', 249.99, 5.00, '56 Le Loi', '56 Le Loi', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'COMPLETED', 59.99, 3.00, '78 Tran Hung Dao', '78 Tran Hung Dao', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 199.00, 5.00, '90 Phan Chu Trinh', '90 Phan Chu Trinh', '0900000004', 'Để ở lễ tân'),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 149.98, 3.00, '11 Ly Thuong Kiet', '11 Ly Thuong Kiet', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'SHIPPING', 89.99, 3.00, '22 Dinh Tien Hoang', '22 Dinh Tien Hoang', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'COMPLETED', 179.98, 5.00, '33 Nguyen Hue', '33 Nguyen Hue', '0900000004', 'Giao buổi chiều'),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 39.98, 3.00, '44 Pasteur', '44 Pasteur', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 299.00, 5.00, '55 Vo Thi Sau', '55 Vo Thi Sau', '0900000004', NULL);

-- Order details for the 10 new orders
INSERT INTO order_details (order_id, product_id, quantity, price)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), (SELECT id FROM products WHERE name='Laptop Pro 14"' LIMIT 1), 1, 1299.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), (SELECT id FROM products WHERE name='Áo thun Basic' LIMIT 1), 2, 19.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 2), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1), 1, 199.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 3), (SELECT id FROM products WHERE name='Giày Sneaker' LIMIT 1), 1, 59.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 4), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1), 1, 199.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), (SELECT id FROM products WHERE name='Bộ nồi Inox' LIMIT 1), 1, 89.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 6), (SELECT id FROM products WHERE name='Máy xay sinh tố' LIMIT 1), 1, 49.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), (SELECT id FROM products WHERE name='Áo thun Basic' LIMIT 1), 1, 19.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), (SELECT id FROM products WHERE name='Smartphone X' LIMIT 1), 1, 899.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 9), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1), 1, 199.00);

-- Payments for the 10 new orders
INSERT INTO payments (order_id, payment_method, amount, status, transaction_id, payment_date)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), 'PAYPAL', 1299.00, 'COMPLETED', 'TXN-2001', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), 'CASH_ON_DELIVERY', 79.98, 'PENDING', 'COD-2002', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 2), 'MOMO', 199.00, 'PENDING', 'MOMO-2003', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 3), 'CASH_ON_DELIVERY', 59.99, 'PENDING', 'COD-2004', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 4), 'PAYPAL', 199.00, 'COMPLETED', 'TXN-2005', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), 'CASH_ON_DELIVERY', 89.99, 'PENDING', 'COD-2006', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 6), 'CASH_ON_DELIVERY', 49.99, 'PENDING', 'COD-2007', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), 'PAYPAL', 19.99, 'COMPLETED', 'TXN-2008', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), 'PAYPAL', 899.99, 'COMPLETED', 'TXN-2009', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 9), 'MOMO', 199.00, 'PENDING', 'MOMO-2010', NOW());

-- Order status history for the 10 new orders
INSERT INTO order_status_history (order_id, status, note, created_at, created_by)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 2), 'SHIPPING', 'Handed to carrier', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 3), 'COMPLETED', 'Delivered to customer', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 4), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 6), 'SHIPPING', 'Handed to carrier', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), 'COMPLETED', 'Delivered to customer', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 9), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1));

-- Additional reviews (20 total across products)
INSERT INTO review_products (user_id, product_id, rating, comment, created_at)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Smartphone X' LIMIT 1), 4, 'Máy mượt, pin tốt', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Smartphone X' LIMIT 1), 5, 'Rất đáng tiền', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Laptop Pro 14"' LIMIT 1), 5, 'Hiệu năng tuyệt vời', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Laptop Pro 14"' LIMIT 1), 4, 'Pin ổn, màn đẹp', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1), 4, 'Chống ồn tốt', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1), 3, 'Giá hơi cao', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Áo thun Basic' LIMIT 1), 5, 'Vải mát, form đẹp', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Áo thun Basic' LIMIT 1), 4, 'Mặc rất thoải mái', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Giày Sneaker' LIMIT 1), 4, 'Êm chân', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Giày Sneaker' LIMIT 1), 5, 'Đẹp, đúng size', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Bộ nồi Inox' LIMIT 1), 4, 'Nấu nhanh, dễ vệ sinh', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Bộ nồi Inox' LIMIT 1), 3, 'Khá nặng', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Máy xay sinh tố' LIMIT 1), 4, 'Xay khỏe', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Máy xay sinh tố' LIMIT 1), 5, 'Giá tốt', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Smartphone X' LIMIT 1), 5, 'Camera đẹp', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Laptop Pro 14"' LIMIT 1), 4, 'Hoàn thiện tốt', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Tai nghe ANC' LIMIT 1), 4, 'Bass mạnh', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Áo thun Basic' LIMIT 1), 5, 'Sẽ mua thêm', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Giày Sneaker' LIMIT 1), 4, 'Đi êm', NOW()),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), (SELECT id FROM products WHERE name='Bộ nồi Inox' LIMIT 1), 5, 'Chất lượng tốt', NOW());

-- Additional products (10 more)
INSERT INTO products (name, description, price, quantity, image, active, store_id, category_id)
VALUES
  ('Tablet Air', 'Màn hình 10.9", pin lâu', 499.00, 40, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store' LIMIT 1),
   (SELECT id FROM categories WHERE name='Điện tử' LIMIT 1)),
  ('Smartwatch S', 'Theo dõi sức khỏe 24/7', 199.00, 70, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store' LIMIT 1),
   (SELECT id FROM categories WHERE name='Điện tử' LIMIT 1)),
  ('Loa Bluetooth Mini', 'Âm thanh to, pin 12h', 39.99, 150, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store' LIMIT 1),
   (SELECT id FROM categories WHERE name='Điện tử' LIMIT 1)),
  ('Áo khoác nhẹ', 'Chống gió, tiện dụng', 49.99, 90, NULL, 1,
   (SELECT id FROM stores WHERE name='Fashion Hub' LIMIT 1),
   (SELECT id FROM categories WHERE name='Thời trang' LIMIT 1)),
  ('Quần jeans slim', 'Form ôm vừa', 39.99, 110, NULL, 1,
   (SELECT id FROM stores WHERE name='Fashion Hub' LIMIT 1),
   (SELECT id FROM categories WHERE name='Thời trang' LIMIT 1)),
  ('Bàn làm việc', 'Gỗ MDF, kích thước 120cm', 129.00, 30, NULL, 1,
   (SELECT id FROM stores WHERE name='Home Plus' LIMIT 1),
   (SELECT id FROM categories WHERE name='Nhà cửa' LIMIT 1)),
  ('Ghế công thái học', 'Tựa lưng êm ái', 199.00, 25, NULL, 1,
   (SELECT id FROM stores WHERE name='Home Plus' LIMIT 1),
   (SELECT id FROM categories WHERE name='Nhà cửa' LIMIT 1)),
  ('Máy đo huyết áp', 'Đo nhanh, chính xác', 59.99, 60, NULL, 1,
   (SELECT id FROM stores WHERE name='Home Plus' LIMIT 1),
   (SELECT id FROM categories WHERE name='Sức khỏe' LIMIT 1)),
  ('Thảm tập yoga', 'Chống trượt, dày 6mm', 19.99, 200, NULL, 1,
   (SELECT id FROM stores WHERE name='Fashion Hub' LIMIT 1),
   (SELECT id FROM categories WHERE name='Thể thao' LIMIT 1)),
  ('Dây kháng lực', 'Bộ 5 mức lực', 14.99, 180, NULL, 1,
   (SELECT id FROM stores WHERE name='Fashion Hub' LIMIT 1),
   (SELECT id FROM categories WHERE name='Thể thao' LIMIT 1));

-- Additional demo orders (10 more)
INSERT INTO orders (user_id, order_date, status, total_amount, shipping_fee, address, shipping_address, phone_number, notes)
VALUES
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 538.99, 5.00, '66 Nguyen Van Cu', '66 Nguyen Van Cu', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 89.98, 3.00, '77 Cach Mang', '77 Cach Mang', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'SHIPPING', 199.00, 5.00, '88 Dien Bien Phu', '88 Dien Bien Phu', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'COMPLETED', 129.00, 5.00, '99 Truong Chinh', '99 Truong Chinh', '0900000004', 'Giao buổi sáng'),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 59.99, 3.00, '101 Hai Ba Trung', '101 Hai Ba Trung', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 214.98, 5.00, '202 Nguyen Dinh Chieu', '202 Nguyen Dinh Chieu', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'SHIPPING', 19.99, 3.00, '303 Tran Phu', '303 Tran Phu', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'COMPLETED', 239.98, 5.00, '404 Le Duan', '404 Le Duan', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PAID', 79.98, 3.00, '505 Phan Xich Long', '505 Phan Xich Long', '0900000004', NULL),
  ((SELECT id FROM users WHERE username='user' LIMIT 1), NOW(), 'PROCESSING', 19.99, 3.00, '606 Nguyen Oanh', '606 Nguyen Oanh', '0900000004', NULL);

-- Order details for the 10 new orders
INSERT INTO order_details (order_id, product_id, quantity, price)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), (SELECT id FROM products WHERE name='Tablet Air' LIMIT 1), 1, 499.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), (SELECT id FROM products WHERE name='Loa Bluetooth Mini' LIMIT 1), 1, 39.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), (SELECT id FROM products WHERE name='Áo khoác nhẹ' LIMIT 1), 1, 49.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), (SELECT id FROM products WHERE name='Thảm tập yoga' LIMIT 1), 2, 19.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 2), (SELECT id FROM products WHERE name='Smartwatch S' LIMIT 1), 1, 199.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 3), (SELECT id FROM products WHERE name='Bàn làm việc' LIMIT 1), 1, 129.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 4), (SELECT id FROM products WHERE name='Máy đo huyết áp' LIMIT 1), 1, 59.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), (SELECT id FROM products WHERE name='Ghế công thái học' LIMIT 1), 1, 199.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), (SELECT id FROM products WHERE name='Dây kháng lực' LIMIT 1), 1, 14.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 6), (SELECT id FROM products WHERE name='Thảm tập yoga' LIMIT 1), 1, 19.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), (SELECT id FROM products WHERE name='Smartwatch S' LIMIT 1), 1, 199.00),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), (SELECT id FROM products WHERE name='Loa Bluetooth Mini' LIMIT 1), 1, 39.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), (SELECT id FROM products WHERE name='Áo khoác nhẹ' LIMIT 1), 1, 49.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), (SELECT id FROM products WHERE name='Quần jeans slim' LIMIT 1), 1, 39.99),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 9), (SELECT id FROM products WHERE name='Thảm tập yoga' LIMIT 1), 1, 19.99);

-- Payments for the 10 new orders
INSERT INTO payments (order_id, payment_method, amount, status, transaction_id, payment_date)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), 'PAYPAL', 538.99, 'COMPLETED', 'TXN-3001', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), 'CASH_ON_DELIVERY', 89.98, 'PENDING', 'COD-3002', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 2), 'MOMO', 199.00, 'PENDING', 'MOMO-3003', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 3), 'PAYPAL', 129.00, 'COMPLETED', 'TXN-3004', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 4), 'CASH_ON_DELIVERY', 59.99, 'PENDING', 'COD-3005', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), 'PAYPAL', 214.98, 'COMPLETED', 'TXN-3006', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 6), 'CASH_ON_DELIVERY', 19.99, 'PENDING', 'COD-3007', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), 'MOMO', 239.98, 'PENDING', 'MOMO-3008', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), 'PAYPAL', 79.98, 'COMPLETED', 'TXN-3009', NOW()),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 9), 'CASH_ON_DELIVERY', 19.99, 'PENDING', 'COD-3010', NOW());

-- Order status history for the 10 new orders
INSERT INTO order_status_history (order_id, status, note, created_at, created_by)
VALUES
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 1), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 2), 'SHIPPING', 'Handed to carrier', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 3), 'COMPLETED', 'Delivered to customer', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 4), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 5), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 6), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 7), 'SHIPPING', 'Handed to carrier', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 8), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1)),
  ((SELECT id FROM orders ORDER BY id DESC LIMIT 1 OFFSET 9), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='seller' LIMIT 1));
