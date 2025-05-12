package com.ecommerce.controllers;

import com.ecommerce.pojo.User;
import com.ecommerce.services.EmailService;
import com.ecommerce.services.PasswordResetService;
import com.ecommerce.services.UserService;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class ApiPasswordResetController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email không được để trống"));
        }

        User user = userService.findByEmail(email);
        if (user == null) {
            // Trả về thành công ngay cả khi email không tồn tại (bảo mật)
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Nếu email tồn tại, một liên kết đặt lại mật khẩu sẽ được gửi"));
        }

        try {
            // Tạo token ngẫu nhiên
            String token = UUID.randomUUID().toString();

            // Lưu token vào cơ sở dữ liệu
            passwordResetService.createPasswordResetTokenForUser(user, token);

            // Gửi email đặt lại mật khẩu
            emailService.sendPasswordResetEmail(email, token);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra khi gửi email đặt lại mật khẩu: " + e.getMessage()));
        }
    }

    @GetMapping("/reset/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam("token") String token) {
        String result = passwordResetService.validatePasswordResetToken(token);
        System.out.println("Kết quả xác thực token: " + result);
        Map<String, Object> response = new HashMap<>();
        if (result != null) {
            response.put("success", false);

            switch (result) {
                case "invalidToken":
                    response.put("message", "Token không hợp lệ");
                    break;
                case "expired":
                    response.put("message", "Token đã hết hạn");
                    break;
                case "userNotFound":
                    response.put("message", "Không tìm thấy người dùng liên kết với token này");
                    break;
                default:
                    response.put("message", "Có lỗi xảy ra: " + result);
                    break;
            }

            return ResponseEntity.badRequest().body(response);
        }

        // Token hợp lệ
        User user = passwordResetService.getUserByPasswordResetToken(token);
        response.put("success", true);
        response.put("message", "Token hợp lệ");
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> resetRequest) {
        String token = resetRequest.get("token");
        String newPassword = resetRequest.get("password");

        if (token == null || token.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token và mật khẩu mới không được để trống"));
        }

        // Kiểm tra token hợp lệ
        String validationResult = passwordResetService.validatePasswordResetToken(token);
        if (validationResult != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);

            switch (validationResult) {
                case "invalidToken":
                    response.put("message", "Token không hợp lệ");
                    break;
                case "expired":
                    response.put("message", "Token đã hết hạn");
                    break;
                case "userNotFound":
                    response.put("message", "Không tìm thấy người dùng liên kết với token này");
                    break;
                default:
                    response.put("message", "Có lỗi xảy ra: " + validationResult);
                    break;
            }

            return ResponseEntity.badRequest().body(response);
        }

        User user = passwordResetService.getUserByPasswordResetToken(token);

        try {
            // Cập nhật mật khẩu mới
            passwordResetService.changeUserPassword(user, newPassword);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mật khẩu đã được đặt lại thành công"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra khi đặt lại mật khẩu: " + e.getMessage()));
        }
    }
}