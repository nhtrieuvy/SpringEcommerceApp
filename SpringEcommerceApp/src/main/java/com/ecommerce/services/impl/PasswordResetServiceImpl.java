package com.ecommerce.services.impl;

import com.ecommerce.pojo.PasswordResetToken;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.PasswordResetTokenRepository;
import com.ecommerce.services.PasswordResetService;
import com.ecommerce.services.UserService;
import java.util.Calendar;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetServiceImpl.class);

    private static final int EXPIRATION_TIME = 24;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void createPasswordResetTokenForUser(User user, String token) {
        logger.debug("===== CREATING PASSWORD RESET TOKEN =====");
        logger.debug("User: {} (ID: {})", user.getUsername(), user.getId());
        logger.debug("Token: {}", token);

        try {
            PasswordResetToken existingToken = passwordResetTokenRepository.findByUser(user);
            if (existingToken != null) {
                logger.debug("Đã tìm thấy token cũ: {}", existingToken.getToken());
                logger.debug("Xóa token cũ");
                passwordResetTokenRepository.delete(existingToken);
            }

            PasswordResetToken myToken = new PasswordResetToken();
            myToken.setToken(token);
            myToken.setUser(user);
            myToken.setExpiryDate(calculateExpiryDate());
            logger.debug("Hạn sử dụng token: {}", myToken.getExpiryDate());

            logger.debug("Lưu token mới vào database");
            passwordResetTokenRepository.save(myToken);

            PasswordResetToken savedToken = passwordResetTokenRepository.findByToken(token);
            if (savedToken != null) {
                logger.debug("Token đã được lưu thành công trong database!");
                logger.debug("ID: {}", savedToken.getId());
                logger.debug("Token: {}", savedToken.getToken());
                logger.debug("User ID: {}", savedToken.getUser().getId());
            } else {
                logger.error("LỖI: Token không được tìm thấy trong database sau khi lưu!");
            }
        } catch (Exception e) {
            logger.error("LỖI khi tạo password reset token", e);
            throw e;
        }
        logger.debug("===== KẾT THÚC TẠO TOKEN =====");
    }

    @Override
    public String validatePasswordResetToken(String token) {
        logger.debug("===== VALIDATING PASSWORD RESET TOKEN =====");
        logger.debug("Token cần xác thực: {}", token);

        try {
            logger.debug("Tìm kiếm token trong database...");
            PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token);

            if (passToken == null) {
                logger.error("LỖI: Token không tồn tại trong database!");
                return "invalidToken";
            }

            logger.debug("Tìm thấy token trong database. ID: {}", passToken.getId());

            User user = passToken.getUser();
            if (user == null) {
                logger.error("LỖI: Không tìm thấy user liên kết với token!");
                return "userNotFound";
            }

            logger.debug("User liên kết với token: {}", user.getUsername());

            Calendar cal = Calendar.getInstance();
            if (passToken.getExpiryDate().before(cal.getTime())) {
                logger.error("LỖI: Token đã hết hạn!");
                logger.error("Hạn sử dụng: {}", passToken.getExpiryDate());
                logger.error("Thời gian hiện tại: {}", cal.getTime());
                passwordResetTokenRepository.delete(passToken);
                return "expired";
            }

            logger.debug("Token hợp lệ và chưa hết hạn!");
            logger.debug("===== KẾT THÚC XÁC THỰC TOKEN =====");
            return null;
        } catch (Exception e) {
            logger.error("LỖI khi xác thực token", e);
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
        logger.debug("===== CHANGING USER PASSWORD =====");
        logger.debug("User: {}", user.getUsername());
        try {
            String encodedPassword = passwordEncoder.encode(password);
            user.setPassword(encodedPassword);
            userService.update(user);
            logger.debug("Mật khẩu đã được cập nhật thành công!");

            logger.debug("Tìm và xóa token...");
            PasswordResetToken token = passwordResetTokenRepository.findByUser(user);
            if (token != null) {
                logger.debug("Tìm thấy token. Xóa token: {}", token.getToken());
                passwordResetTokenRepository.delete(token);
            } else {
                logger.debug("Không tìm thấy token cho user này.");
            }
            logger.debug("===== KẾT THÚC THAY ĐỔI MẬT KHẨU =====");
        } catch (Exception e) {
            logger.error("LỖI khi thay đổi mật khẩu", e);
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