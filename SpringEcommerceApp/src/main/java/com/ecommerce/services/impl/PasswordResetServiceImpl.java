package com.ecommerce.services.impl;

import com.ecommerce.pojo.PasswordResetToken;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.PasswordResetTokenRepository;
import com.ecommerce.services.PasswordResetService;
import com.ecommerce.services.UserService;
import java.util.Calendar;
import java.util.Date;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final int EXPIRATION_TIME = 24; // Token hết hạn sau 24 giờ
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void createPasswordResetTokenForUser(User user, String token) {
        System.out.println("===== CREATING PASSWORD RESET TOKEN =====");
        System.out.println("User: " + user.getUsername() + " (ID: " + user.getId() + ")");
        System.out.println("Token: " + token);
        
        try {
            // Kiểm tra xem đã có token nào tồn tại cho user này chưa
            PasswordResetToken existingToken = passwordResetTokenRepository.findByUser(user);
            if (existingToken != null) {
                System.out.println("Đã tìm thấy token cũ: " + existingToken.getToken());
                System.out.println("Xóa token cũ");
                // Nếu đã tồn tại token, xóa nó để tạo token mới
                passwordResetTokenRepository.delete(existingToken);
            }
            
            // Tạo token mới
            PasswordResetToken myToken = new PasswordResetToken();
            myToken.setToken(token);
            myToken.setUser(user);
            myToken.setExpiryDate(calculateExpiryDate());
            System.out.println("Hạn sử dụng token: " + myToken.getExpiryDate());
            
            // Lưu token mới vào database
            System.out.println("Lưu token mới vào database");
            passwordResetTokenRepository.save(myToken);
            
            // Xác nhận token đã được lưu
            PasswordResetToken savedToken = passwordResetTokenRepository.findByToken(token);
            if (savedToken != null) {
                System.out.println("Token đã được lưu thành công trong database!");
                System.out.println("ID: " + savedToken.getId());
                System.out.println("Token: " + savedToken.getToken());
                System.out.println("User ID: " + savedToken.getUser().getId());
            } else {
                System.err.println("LỖI: Token không được tìm thấy trong database sau khi lưu!");
            }
        } catch (Exception e) {
            System.err.println("LỖI khi tạo password reset token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        System.out.println("===== KẾT THÚC TẠO TOKEN =====");
    }

    @Override
    public String validatePasswordResetToken(String token) {
        System.out.println("===== VALIDATING PASSWORD RESET TOKEN =====");
        System.out.println("Token cần xác thực: " + token);
        
        try {
            // Tìm token trong database
            System.out.println("Tìm kiếm token trong database...");
            PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token);
            
            if (passToken == null) {
                System.err.println("LỖI: Token không tồn tại trong database!");
                return "invalidToken";
            }
            
            System.out.println("Tìm thấy token trong database. ID: " + passToken.getId());
            
            // Kiểm tra user
            User user = passToken.getUser();
            if (user == null) {
                System.err.println("LỖI: Không tìm thấy user liên kết với token!");
                return "userNotFound";
            }
            
            System.out.println("User liên kết với token: " + user.getUsername());
            
            // Kiểm tra hạn sử dụng
            Calendar cal = Calendar.getInstance();
            if (passToken.getExpiryDate().before(cal.getTime())) {
                System.err.println("LỖI: Token đã hết hạn!");
                System.err.println("Hạn sử dụng: " + passToken.getExpiryDate());
                System.err.println("Thời gian hiện tại: " + cal.getTime());
                passwordResetTokenRepository.delete(passToken);
                return "expired";
            }
            
            System.out.println("Token hợp lệ và chưa hết hạn!");
            System.out.println("===== KẾT THÚC XÁC THỰC TOKEN =====");
            return null; // Trả về null nếu token hợp lệ
        } catch (Exception e) {
            System.err.println("LỖI khi xác thực token: " + e.getMessage());
            e.printStackTrace();
            return "error";
        }
    }

    @Override
    public User getUserByPasswordResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token);
        if (resetToken != null) {
            return resetToken.getUser();
        }
        return null;
    }

    @Override
    public void changeUserPassword(User user, String password) {
        System.out.println("===== CHANGING USER PASSWORD =====");
        System.out.println("User: " + user.getUsername());
        try {
            String encodedPassword = passwordEncoder.encode(password);
            user.setPassword(encodedPassword);
            userService.update(user);
            System.out.println("Mật khẩu đã được cập nhật thành công!");
            
            // Xóa token sau khi đã đổi mật khẩu thành công
            System.out.println("Tìm và xóa token...");
            PasswordResetToken token = passwordResetTokenRepository.findByUser(user);
            if (token != null) {
                System.out.println("Tìm thấy token. Xóa token: " + token.getToken());
                passwordResetTokenRepository.delete(token);
            } else {
                System.out.println("Không tìm thấy token cho user này.");
            }
            System.out.println("===== KẾT THÚC THAY ĐỔI MẬT KHẨU =====");
        } catch (Exception e) {
            System.err.println("LỖI khi thay đổi mật khẩu: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public boolean checkIfValidOldPassword(User user, String oldPassword) {
        return passwordEncoder.matches(oldPassword, user.getPassword());
    }
    
    private Date calculateExpiryDate() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, EXPIRATION_TIME);
        return cal.getTime();
    }
}