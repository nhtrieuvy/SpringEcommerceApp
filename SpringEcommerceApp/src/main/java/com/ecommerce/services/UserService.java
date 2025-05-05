package com.ecommerce.services;

import com.ecommerce.pojo.User;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;

public interface UserService extends UserDetailsService {
    User addUser(Map<String, String> params, MultipartFile avatar);
    boolean authenticate(String username, String password);
    void update(User user);
    void delete(Long id);
    User findById(Long id);
    List<User> findAll();
    User findByUsername(String username);
    User findByEmail(String email);
    
    // Phương thức mới cho chức năng profile
    void updateAvatar(User user, MultipartFile avatar);
    void changePassword(User user, String newPassword);
    
    @Override
    UserDetails loadUserByUsername(String username);
}