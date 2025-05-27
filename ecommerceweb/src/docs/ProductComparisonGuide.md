# Hướng dẫn sử dụng tính năng So sánh sản phẩm

## Tổng quan

Tính năng so sánh sản phẩm cho phép người dùng so sánh nhiều sản phẩm **cùng loại** để đưa ra quyết định mua hàng tốt hơn. Hệ thống đảm bảo chỉ các sản phẩm cùng danh mục mới được so sánh với nhau để đảm bảo so sánh chính xác và công bằng. Giao diện đã được cập nhật với Material UI để cải thiện trải nghiệm người dùng và bổ sung tính năng tìm kiếm nâng cao.

## Cách sử dụng

### Truy cập tính năng so sánh sản phẩm

Có ba cách để truy cập tính năng so sánh sản phẩm:

1. **Từ trang chi tiết sản phẩm**: Nhấn vào nút "So sánh với sản phẩm khác" trên trang chi tiết sản phẩm
2. **Từ danh sách sản phẩm theo danh mục**: Nhấn vào nút "So sánh sản phẩm" trên trang danh mục
3. **Trực tiếp qua URL**: Truy cập `/products/compare?categoryId={categoryId}` hoặc `/products/compare?productId={productId}`

### Thêm sản phẩm để so sánh

Bạn có thể thêm sản phẩm để so sánh bằng hai cách:

#### Tìm kiếm sản phẩm
1. Trên trang so sánh sản phẩm, nhấn vào nút "Tìm sản phẩm"
2. Trong hộp thoại hiện ra, nhập tên sản phẩm bạn muốn tìm kiếm
3. Hệ thống sẽ chỉ hiển thị các sản phẩm cùng danh mục với sản phẩm đang so sánh
4. Chọn sản phẩm từ kết quả tìm kiếm
5. Nhấn "Thêm vào so sánh" để thêm sản phẩm vào bảng so sánh

#### Chọn từ danh mục
1. Nhấn vào nút "Chọn sản phẩm để so sánh"
2. Hệ thống sẽ hiển thị các sản phẩm trong cùng danh mục với sản phẩm hiện tại
3. Bạn có thể tìm kiếm sản phẩm trong danh mục bằng cách nhập từ khóa vào ô tìm kiếm
4. Sử dụng bộ lọc nâng cao để lọc theo giá, đánh giá hoặc tình trạng tồn kho
5. Nhấn "Xem so sánh" để quay lại trang so sánh với các sản phẩm đã chọn

### Xem thông tin chi tiết

- Các sản phẩm sẽ được hiển thị dạng bảng (trên desktop) hoặc dạng thẻ (trên thiết bị di động)
- Các thông tin được so sánh bao gồm:
  - Hình ảnh và tên sản phẩm
  - Giá bán và so sánh với giá trung bình
  - Đánh giá từ người dùng
  - Cửa hàng
  - Tình trạng hàng
  - Mô tả sản phẩm

### Các tính năng đặc biệt

- **Đánh dấu sản phẩm tốt nhất**: Sản phẩm có giá thấp nhất được đánh dấu "Giá tốt nhất"
- **Đánh dấu sản phẩm được đánh giá cao nhất**: Sản phẩm có đánh giá cao nhất được đánh dấu "Đánh giá cao nhất"
- **So sánh giá**: Hiển thị % chênh lệch giá so với giá trung bình của các sản phẩm cùng loại
- **Thêm vào giỏ hàng**: Thêm sản phẩm vào giỏ hàng trực tiếp từ trang so sánh
- **Lọc sản phẩm**: Tìm kiếm sản phẩm trong danh mục theo tên, mô tả hoặc cửa hàng
- **Xóa sản phẩm**: Dễ dàng xóa sản phẩm khỏi bảng so sánh với nút xóa
- **Đảm bảo cùng loại**: Hệ thống chỉ cho phép so sánh các sản phẩm cùng danh mục

### Các thao tác khác

- **Xem chi tiết sản phẩm**: Nhấn vào tên hoặc hình ảnh sản phẩm để xem trang chi tiết
- **Thêm vào giỏ hàng**: Nhấn nút "Thêm vào giỏ" để thêm sản phẩm vào giỏ hàng
- **Quay lại**: Nhấn nút "Quay lại" nếu xuất hiện lỗi hoặc bạn muốn trở về trang trước
- **Xóa sản phẩm khỏi so sánh**: Nhấn nút xóa (biểu tượng thùng rác) để xóa sản phẩm khỏi bảng so sánh

## Giao diện

- **Giao diện Desktop**: Hiển thị dạng bảng với các cột cho từng sản phẩm và các hàng cho từng thuộc tính
- **Giao diện Mobile**: Hiển thị dạng thẻ (card) riêng biệt cho từng sản phẩm để dễ dàng xem trên thiết bị di động

## Ghi chú kỹ thuật

- Giao diện đã được cập nhật sử dụng Material UI thay thế cho React Bootstrap
- Hỗ trợ đầy đủ responsive trên cả desktop và thiết bị di động
- Thêm tính năng tìm kiếm và thêm sản phẩm vào so sánh
- Bổ sung tính năng lọc sản phẩm trong danh mục
- Kiểm tra và đảm bảo chỉ so sánh sản phẩm cùng danh mục
- Animation khi thêm sản phẩm vào giỏ hàng
- Tối ưu hiển thị thông báo (snackbar) thay vì alert
- Tính toán lại các so sánh khi danh sách sản phẩm thay đổi
- Đánh dấu trực quan các sản phẩm được chọn trong danh sách
- Hiển thị danh mục sản phẩm đang so sánh để người dùng dễ theo dõi
