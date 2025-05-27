# Hướng dẫn cập nhật cơ sở dữ liệu cho Order Address Fields

Tài liệu này hướng dẫn cách thực hiện các thay đổi cần thiết để thêm các trường địa chỉ và thông tin bổ sung vào bảng `orders`.

## Thay đổi đã thực hiện

1. **Entity Order**: 
   - Đã thêm các trường mới: `address`, `shippingAddress`, `phoneNumber`, `notes`
   - Đã thêm các getter và setter

2. **ApiOrderController**:
   - Đã sửa phương thức `createOrderFromDTO` để lưu thông tin địa chỉ giao hàng vào các trường mới
   - Đã cập nhật phương thức `getOrderById` và `getOrderFullDetails` để trả về thông tin địa chỉ

3. **Cơ sở dữ liệu**:
   - Tạo script SQL để thêm các cột mới vào bảng `orders`

## Cách áp dụng các thay đổi

### 1. Chạy script SQL để cập nhật cơ sở dữ liệu

```sql
-- Thêm các cột mới vào bảng orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes VARCHAR(1000);

-- Cập nhật các đơn hàng hiện có với thông tin từ người dùng
UPDATE orders o SET 
    phone_number = (SELECT phone FROM users WHERE id = o.user_id)
WHERE o.phone_number IS NULL;
```

### 2. Rebuild và triển khai ứng dụng

1. Biên dịch dự án:
```
mvn clean package
```

2. Triển khai tệp WAR mới:
```
cp target/SpringEcommerceApp-1.0-SNAPSHOT.war {đường_dẫn_đến_tomcat}/webapps/
```

## Kiểm tra các thay đổi

Sau khi triển khai, hãy kiểm tra các chức năng sau:

1. **Tạo đơn hàng mới**: Kiểm tra xem thông tin địa chỉ có được lưu đúng không
2. **Xem chi tiết đơn hàng**: Kiểm tra xem thông tin địa chỉ có được hiển thị không
3. **Danh sách đơn hàng**: Kiểm tra hiển thị trên giao diện

## Phần frontend

Phía frontend đã được thiết kế để hiển thị thông tin này nếu API cung cấp. Không cần thêm thay đổi nào cho phía frontend ngoài việc đảm bảo rằng các API endpoints trả về đúng định dạng.

## Lưu ý

- Nếu bạn đang sử dụng một hệ thống quản lý migration như Flyway hoặc Liquibase, hãy thêm script migration thay vì chạy SQL trực tiếp.
- Đảm bảo sao lưu cơ sở dữ liệu trước khi thực hiện các thay đổi.
