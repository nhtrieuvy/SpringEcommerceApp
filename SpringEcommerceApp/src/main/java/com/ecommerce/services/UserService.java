package com.ecommerce.services;

import com.ecommerce.pojo.User;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.pojo.Role;

public interface UserService extends UserDetailsService {
    User addUser(Map<String, String> params, MultipartFile avatar);
    User addUser(User user); // Thêm phương thức mới để hỗ trợ đăng nhập mạng xã hội
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
    
    // Phương thức thêm vai trò cho người dùng
    void addRoleToUser(User user, Role role);
    
    @Override
    UserDetails loadUserByUsername(String username);
}