package com.ecommerce.repositories;

import com.ecommerce.pojo.PasswordResetToken;
import com.ecommerce.pojo.User;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository {
    PasswordResetToken findByToken(String token);
    PasswordResetToken findByUser(User user);
    void save(PasswordResetToken passwordResetToken);
    void delete(PasswordResetToken passwordResetToken);
}