
## Tóm tắt chức năng hệ thống

- Đăng nhập/đăng ký: JWT, Google, Facebook
- Quản lý người dùng, đổi mật khẩu, cập nhật thông tin cá nhân
- Quản lý sản phẩm, danh mục, tìm kiếm, so sánh sản phẩm
- Quản lý cửa hàng, người bán, duyệt yêu cầu đăng ký bán hàng
- Giỏ hàng, wishlist, thêm/xóa/sửa sản phẩm
- Đặt hàng, xem lịch sử đơn hàng, chi tiết đơn hàng
- Thanh toán MoMo, PayPal (sandbox), kiểm tra trạng thái thanh toán
- Đánh giá sản phẩm, phản hồi đánh giá
- Chat giữa người dùng và người bán, thông báo chat realtime
- Quản trị hệ thống: quản lý người dùng, sản phẩm, đơn hàng, xuất báo cáo, thống kê doanh số
- Bảo mật: phân quyền, xác thực, xử lý lỗi tập trung

## SpringEcommerceApp – Hệ thống E‑Commerce (Spring MVC + React)

Monorepo gồm Backend (Java Spring MVC, WAR, chạy HTTPS) và Frontend (React). Hỗ trợ đăng nhập JWT, Google, Facebook, giỏ hàng, wishlist, đơn hàng, quản lý người bán, thanh toán MoMo/PayPal, và trang quản trị (Thymeleaf).

## Kiến trúc tổng quan

- Backend: `SpringEcommerceApp/` (WAR, Servlet stack, Spring 6, chạy HTTPS 8443)
	- MVC + REST API dưới context path: `/SpringEcommerceApp-1.0-SNAPSHOT`
	- Bảo mật: Spring Security 6, JWT filter cho `/api/**`, xác thực JWT, Google, Facebook
	- ORM: Hibernate 6 + HikariCP, MySQL
	- Cache: Ehcache (JSR‑107)
	- View Admin: Thymeleaf (Spring Security dialect)
	- Tích hợp: Cloudinary (upload ảnh), MoMo, PayPal

- Frontend: `ecommerceweb/` (React + MUI)
	- Dev server: https://localhost:3000
	- Proxy HTTPS đến backend qua `setupProxy.js`
	- Đăng nhập Google/Facebook đã cấu hình, sử dụng Context API + reducer quản lý phiên

## Yêu cầu hệ thống

- Java 21, Maven 3.9+
- Node.js 18+ và npm
- MySQL 8+ (database mặc định: `ecommercedb`)
- OpenSSL (nếu cần tự tạo chứng chỉ dev) hoặc dùng keystore có sẵn

## Cấu hình quan trọng (Backend)

Các file cấu hình chính:

- `src/main/resources/database.properties`
	- JDBC URL: `jdbc:mysql://localhost:3306/ecommercedb?...`
	- Username/Password: cập nhật cho môi trường của bạn
	- hbm2ddl: `update` (tự tạo/upgrade schema)

- `src/main/resources/application.properties`
	- Mail (SMTP), App URL (dùng cho link reset & callback), logging
	- PayPal: `paypal.client.id`, `paypal.client.secret`, `paypal.mode`
	- MoMo: `momo.partnerCode`, `momo.accessKey`, `momo.secretKey`, `momo.returnUrl`, `momo.notifyUrl`

- POM (Maven):
	- Packaging: `war`
	- Tomcat plugin (HTTPS 8443, keystore `keystore.p12`) – dùng để chạy dev nhanh

Lưu ý bảo mật: không commit secret thật. Thay giá trị trong properties bằng biến môi trường/secret manager ở môi trường thật.

## Cấu hình quan trọng (Frontend)

- `src/configs/Apis.js`
	- `BASE_URL = "/SpringEcommerceApp-1.0-SNAPSHOT"` (trùng context backend)
	- Axios instance `authApi()` tự gắn Header Authorization từ cookie/localStorage

- `src/setupProxy.js`
	- Proxy path: `/SpringEcommerceApp-1.0-SNAPSHOT`
	- Target mặc định: `https://localhost:8443` (self‑signed), có tùy chọn dùng Ngrok theo biến môi trường `HOST`

- `src/App.js`
	- Google OAuth Client Id: cần thay ID của bạn (Google Cloud). Hiện đang hard‑code.

## Chạy Backend (Dev)

1) Tạo database MySQL và cập nhật `database.properties` nếu cần.
2) Mở terminal tại thư mục SpringEcommerceApp, chạy:

```powershell
mvn clean package
mvn org.apache.tomcat.maven:tomcat7-maven-plugin:2.2:run
```

3) Backend sẽ chạy tại: `https://localhost:8443/SpringEcommerceApp-1.0-SNAPSHOT` (HTTPS mặc định, đã cấu hình keystore).
4) Đăng nhập Google và Facebook đã sẵn sàng, không cần cấu hình thêm nếu dùng giá trị mẫu.

## Chạy Frontend (Dev)

```powershell
cd ecommerceweb
npm install
npm start
```

- Dev server: `http://localhost:3000`
- Mọi request đến `/SpringEcommerceApp-1.0-SNAPSHOT/**` sẽ proxy sang backend HTTPS 8443 (self‑signed, `secure: false`).
- Đăng nhập Google và Facebook đã cấu hình sẵn, chỉ cần thay Client ID nếu muốn dùng tài khoản riêng.

Nếu dùng Ngrok cho backend public URL:

```powershell
# PowerShell – đặt biến môi trường trước khi start
$env:HOST = "<your-ngrok-hostname>"  # ví dụ: 1234-...ngrok-free.app
npm start
```

Đồng thời cập nhật `application.properties` (app.url, momo.returnUrl, momo.notifyUrl) theo hostname Ngrok.

## Các mô-đun & thư mục đáng chú ý (Backend)

- `configs/`
	- `SpringSecurityConfigs.java`: bảo vệ web (form login cho admin), vai trò
	- `JwtSecurityConfig.java`: bảo vệ `/api/**`, Stateless + JWT filter
	- `HibernateConfigs.java`: datasource, JPA/Hibernate, HikariCP
	- `ThymeleafConfig.java`: cấu hình view engine cho trang admin

- `controllers/`
	- `ApiUserController.java`: login/register, profile, đổi mật khẩu, JWT
	- `ApiSocialLoginController.java`: Google/Facebook login
	- `ApiProductController.java`, `ApiCategoryController.java`, `ApiReviewController.java`
	- `ApiCartController.java`, `ApiWishlistController.java`
	- `ApiOrderController.java`: tạo đơn, chi tiết đơn, lịch sử
	- `ApiPaymentController.java`: MoMo/PayPal callbacks
	- `AdminController.java` + templates Thymeleaf cho trang quản trị

- `services/`
	- `OrderValidationService` (+ impl): validate nghiệp vụ đơn hàng (giá/tồn kho/tổng tiền)

- `exceptions/`
	- `GlobalExceptionHandler.java`: map exception -> HTTP status + payload thống nhất
	- `OrderException`, `ProductException`, `UserException`: phân loại lỗi rõ ràng

- `filters/`
	- `JwtAuthenticationFilter.java`: đọc token từ Header, set SecurityContext

- `utils/`
	- `JwtUtils.java`: sinh/validate JWT (Nimbus JOSE)

## Quy ước API & Auth

- Base path: `/SpringEcommerceApp-1.0-SNAPSHOT`
- REST API: nằm dưới `/api/**`
- Một số endpoint công khai: `/api/login`, `/api/login/google`, `/api/register`, sản phẩm/danh mục, callback thanh toán
- Các endpoint còn lại yêu cầu JWT Bearer token trong `Authorization`

Luồng đăng nhập tiêu biểu (Frontend):

1) Gọi `/api/login` (hoặc `/api/login/google`)
2) Backend trả `{ token, user }`
3) Front gọi `saveAuthCookie(token, user)` để lưu vào cookie/localStorage
4) Mọi request auth dùng `authApi()` sẽ tự đính kèm `Authorization: Bearer <token>`

## Thanh toán

- PayPal Sandbox: cấu hình `paypal.client.id/secret` và `paypal.mode=sandbox`
- MoMo Sandbox: cấu hình `momo.*` và cập nhật `returnUrl/notifyUrl` trỏ về domain của bạn (có context path)
- Khi dùng Ngrok, đảm bảo URL bao gồm `/SpringEcommerceApp-1.0-SNAPSHOT`

## Social Login

- Đăng nhập Google và Facebook đã cấu hình sẵn ở cả frontend và backend.
- Nếu muốn dùng tài khoản Google riêng, thay `GOOGLE_CLIENT_ID` trong `ecommerceweb/src/App.js`.
- Facebook: backend đã hỗ trợ xác thực qua access token, không cần cấu hình thêm nếu dùng giá trị mẫu.

## Build & Deploy

- Backend: `mvn clean package` → WAR trong `target/`
- Frontend: `npm run build` → static build trong `ecommerceweb/build/`

Triển khai production: khuyến nghị deploy WAR trên Tomcat/Servlet container, và phục vụ frontend qua web server (Nginx) trỏ proxy tới backend HTTPS/HTTP phù hợp.

## Mẹo & Khắc phục sự cố

- SSL self‑signed: Proxy đã `secure:false`, nhưng trình duyệt có thể cảnh báo. Chấp nhận chứng chỉ khi truy cập `https://localhost:8443` lần đầu.
- 8443 bận: đổi cổng trong plugin Tomcat (pom) hoặc server ngoài.
- 401/403 khi gọi API: kiểm tra token còn hạn, header `Authorization` được đính đúng dạng `Bearer <token>`.
- CORS: Proxy dev đã xử lý. Nếu gọi trực tiếp không qua proxy, cần cấu hình CORS trong backend.
- Sai callback MoMo/PayPal: xem lại `app.url`, `momo.returnUrl/notifyUrl`, và đường dẫn có kèm context path.



---

Tác giả: Nguyễn Hoàng Triệu Vỹ + Võ Trần Yến Như
