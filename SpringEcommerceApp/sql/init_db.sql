-- Initialize database and sample data for SpringEcommerceApp

DROP DATABASE IF EXISTS ecommercedb;
CREATE DATABASE ecommercedb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommercedb;

-- Tables
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(1024)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  fullname VARCHAR(255),
  phone VARCHAR(255),
  avatar VARCHAR(1024),
  google_id VARCHAR(255),
  facebook_id VARCHAR(255),
  auth_provider VARCHAR(255),
  created_date DATETIME,
  last_login DATETIME,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE stores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  logo VARCHAR(255),
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_date DATETIME,
  seller_id BIGINT,
  CONSTRAINT fk_stores_seller FOREIGN KEY (seller_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DOUBLE NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  active TINYINT(1) NOT NULL DEFAULT 1,
  store_id BIGINT,
  category_id BIGINT,
  CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE review_products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  product_id BIGINT,
  rating INT NOT NULL,
  comment VARCHAR(1000),
  created_at DATETIME,
  CONSTRAINT fk_review_products_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_review_products_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE review_replies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  review_id BIGINT,
  user_id BIGINT,
  comment VARCHAR(1000),
  created_at DATETIME,
  CONSTRAINT fk_review_replies_review FOREIGN KEY (review_id) REFERENCES review_products(id),
  CONSTRAINT fk_review_replies_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  order_date DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  total_amount DOUBLE NOT NULL,
  shipping_fee DOUBLE,
  address VARCHAR(255),
  shipping_address VARCHAR(255),
  phone_number VARCHAR(20),
  notes VARCHAR(1000),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE order_details (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DOUBLE NOT NULL,
  CONSTRAINT fk_order_details_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_details_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DOUBLE NOT NULL,
  status VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255),
  payment_date DATETIME,
  paypal_payer_id VARCHAR(255),
  paypal_capture_id VARCHAR(255),
  UNIQUE KEY uk_payments_order (order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE order_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL,
  note VARCHAR(1000),
  created_at DATETIME NOT NULL,
  created_by BIGINT,
  CONSTRAINT fk_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_status_history_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE cart_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_cart_item_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE wishlist_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  CONSTRAINT fk_wishlist_item_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_wishlist_item_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  expiry_date DATETIME NOT NULL,
  CONSTRAINT fk_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE seller_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  tax_number VARCHAR(255),
  bank_account VARCHAR(255),
  bank_name VARCHAR(255),
  seller_type VARCHAR(255) NOT NULL,
  id_card_front TEXT,
  id_card_back TEXT,
  business_license TEXT,
  status VARCHAR(255) NOT NULL,
  status_notes TEXT,
  reviewed_by VARCHAR(255),
  reviewed_date DATETIME,
  created_date DATETIME NOT NULL,
  CONSTRAINT fk_seller_requests_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE recent_activity (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  activity_type VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  user_email VARCHAR(100),
  user_name VARCHAR(100),
  entity_id BIGINT,
  entity_type VARCHAR(50),
  created_at DATETIME NOT NULL,
  ip_address VARCHAR(45)
) ENGINE=InnoDB;

-- Sample data
INSERT INTO roles (name, description) VALUES
  ('ADMIN', 'System administrator'),
  ('STAFF', 'Staff account'),
  ('SELLER', 'Seller account'),
  ('USER', 'Regular user');

-- BCrypt for "password"
INSERT INTO users (username, password, email, fullname, phone, created_date, last_login, is_active)
VALUES
  ('admin', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5Cw9D6A2qOtH9mI1K1kQZy1uE1K9Ui', 'admin@example.com', 'Admin User', '0900000001', NOW(), NOW(), 1),
  ('staff', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5Cw9D6A2qOtH9mI1K1kQZy1uE1K9Ui', 'staff@example.com', 'Staff User', '0900000002', NOW(), NOW(), 1),
  ('seller', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5Cw9D6A2qOtH9mI1K1kQZy1uE1K9Ui', 'seller@example.com', 'Seller User', '0900000003', NOW(), NOW(), 1),
  ('user', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa5Cw9D6A2qOtH9mI1K1kQZy1uE1K9Ui', 'user@example.com', 'Regular User', '0900000004', NOW(), NOW(), 1);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u
JOIN roles r ON r.name = CASE u.username
  WHEN 'admin' THEN 'ADMIN'
  WHEN 'staff' THEN 'STAFF'
  WHEN 'seller' THEN 'SELLER'
  ELSE 'USER'
END;

INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Phones, laptops, accessories'),
  ('Fashion', 'Clothing and accessories'),
  ('Home', 'Home and kitchen');

INSERT INTO stores (name, description, address, logo, active, created_date, seller_id)
VALUES
  ('Tech Store', 'Electronics and gadgets', '123 Tech Street', NULL, 1, NOW(), (SELECT id FROM users WHERE username='seller'));

INSERT INTO products (name, description, price, quantity, image, active, store_id, category_id) VALUES
  ('Smartphone X', 'High-end smartphone', 899.99, 50, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store'),
   (SELECT id FROM categories WHERE name='Electronics')),
  ('Laptop Pro', 'Powerful laptop for work', 1299.00, 20, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store'),
   (SELECT id FROM categories WHERE name='Electronics')),
  ('T-Shirt Basic', 'Cotton t-shirt', 19.99, 200, NULL, 1,
   (SELECT id FROM stores WHERE name='Tech Store'),
   (SELECT id FROM categories WHERE name='Fashion'));

INSERT INTO orders (user_id, order_date, status, total_amount, shipping_fee, address, shipping_address, phone_number, notes)
VALUES
  ((SELECT id FROM users WHERE username='user'), NOW(), 'PAID', 919.98, 5.00, '123 Main St', '123 Main St', '0900000004', 'Please deliver in the morning');

INSERT INTO order_details (order_id, product_id, quantity, price)
VALUES
  ((SELECT id FROM orders LIMIT 1), (SELECT id FROM products WHERE name='Smartphone X'), 1, 899.99),
  ((SELECT id FROM orders LIMIT 1), (SELECT id FROM products WHERE name='T-Shirt Basic'), 1, 19.99);

INSERT INTO payments (order_id, payment_method, amount, status, transaction_id, payment_date)
VALUES
  ((SELECT id FROM orders LIMIT 1), 'PAYPAL', 919.98, 'COMPLETED', 'TXN-0001', NOW());

INSERT INTO order_status_history (order_id, status, note, created_at, created_by)
VALUES
  ((SELECT id FROM orders LIMIT 1), 'PAID', 'Payment received', NOW(), (SELECT id FROM users WHERE username='admin')),
  ((SELECT id FROM orders LIMIT 1), 'PROCESSING', 'Order is being prepared', NOW(), (SELECT id FROM users WHERE username='staff'));

INSERT INTO cart_item (user_id, product_id, quantity)
VALUES
  ((SELECT id FROM users WHERE username='user'), (SELECT id FROM products WHERE name='Laptop Pro'), 1);

INSERT INTO wishlist_item (user_id, product_id)
VALUES
  ((SELECT id FROM users WHERE username='user'), (SELECT id FROM products WHERE name='Smartphone X'));

INSERT INTO review_products (user_id, product_id, rating, comment, created_at)
VALUES
  ((SELECT id FROM users WHERE username='user'), (SELECT id FROM products WHERE name='Smartphone X'), 5, 'Great product!', NOW());

INSERT INTO review_replies (review_id, user_id, comment, created_at)
VALUES
  ((SELECT id FROM review_products LIMIT 1), (SELECT id FROM users WHERE username='seller'), 'Thank you!', NOW());

INSERT INTO seller_requests (user_id, shop_name, description, address, tax_number, bank_account, bank_name, seller_type, status, status_notes, reviewed_by, reviewed_date, created_date)
VALUES
  ((SELECT id FROM users WHERE username='seller'), 'Tech Store', 'Request to sell electronics', '123 Tech Street', 'TAX-123', '123456789', 'Demo Bank', 'BUSINESS', 'APPROVED', 'Approved for demo', 'admin', NOW(), NOW());

INSERT INTO recent_activity (activity_type, description, user_email, user_name, entity_id, entity_type, created_at, ip_address)
VALUES
  ('LOGIN', 'User logged in', 'user@example.com', 'Regular User', NULL, NULL, NOW(), '127.0.0.1');
