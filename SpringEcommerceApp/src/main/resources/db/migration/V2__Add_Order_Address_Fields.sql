-- Thêm các cột mới vào bảng orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes VARCHAR(1000);

-- Cập nhật các đơn hàng hiện có với thông tin từ người dùng
UPDATE orders o SET 
    phone_number = (SELECT phone FROM users WHERE id = o.user_id)
WHERE o.phone_number IS NULL;
