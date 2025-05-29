package com.ecommerce.services;

import com.ecommerce.pojo.User;

public interface PasswordResetService {
    void createPasswordResetTokenForUser(User user, String token);
    String validatePasswordResetToken(String token);
    User getUserByPasswordResetToken(String token);
    void changeUserPassword(User user, String password);
    boolean checkIfValidOldPassword(User user, String oldPassword);
}