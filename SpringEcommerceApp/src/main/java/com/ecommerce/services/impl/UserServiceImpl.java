package com.ecommerce.services.impl;

import com.ecommerce.pojo.User;
import com.ecommerce.repositories.UserRepository;
import com.ecommerce.services.UserService;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.ecommerce.pojo.Role;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.ConcurrentHashMap;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service("userServiceImpl")
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private Cloudinary cloudinary;
    
    // Cache đơn giản để lưu trữ thông tin UserDetails
    private final Map<String, UserDetails> userDetailsCache = new ConcurrentHashMap<>();

    @Override
    public User addUser(Map<String, String> params, MultipartFile avatar) {
        try {
            User user = new User();
            String username = params.get("username");
            String email = params.get("email");
            
            // Kiểm tra username và email trước khi thêm mới
            if (username == null || username.trim().isEmpty() || 
                email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Username và email không được để trống");
            }
            
            // Kiểm tra username và email đã tồn tại chưa
            if (userRepository.findByUsername(username) != null) {
                throw new IllegalArgumentException("Username đã tồn tại");
            }
            
            if (userRepository.findByEmail(email) != null) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            
            user.setUsername(username.trim());
            user.setEmail(email.trim().toLowerCase());
            
            String password = params.get("password");
            if (password == null || password.isEmpty()) {
                throw new IllegalArgumentException("Mật khẩu không được để trống");
            }
            
            user.setPassword(passwordEncoder.encode(password));
            
            // Upload avatar lên Cloudinary nếu có
            if (avatar != null && !avatar.isEmpty()) {
                try {
                    Map uploadResult = cloudinary.uploader().upload(
                        avatar.getBytes(), 
                        ObjectUtils.asMap(
                            "folder", "ecommerce/avatars",
                            "resource_type", "auto"
                        )
                    );
                    user.setAvatar(uploadResult.get("secure_url").toString());
                } catch (IOException e) {
                    // Log lỗi và tiếp tục, không làm gián đoạn quá trình đăng ký
                    System.err.println("Failed to upload avatar: " + e.getMessage());
                    user.setAvatar(null);
                }
            } else {
                user.setAvatar(null);
            }

            // Lưu user
            return userRepository.addUser(user);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo người dùng: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean authenticate(String username, String password) {
        if (username == null || password == null) {
            return false;
        }
        return userRepository.authenticate(username, password);
    }

    @Override
    @CacheEvict(value = "users", key = "#user.id")
    public void update(User user) {
        userRepository.update(user);
        // Xóa cache khi user được update
        userDetailsCache.remove(user.getUsername());
    }

    @Override
    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) {
        User user = userRepository.findById(id);
        if (user != null) {
            userDetailsCache.remove(user.getUsername());
        }
        userRepository.delete(id);
    }

    @Override
    @Cacheable(value = "users", key = "#id", unless = "#result == null")
    public User findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User findByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(email);
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Kiểm tra cache trước khi truy vấn database
        if (userDetailsCache.containsKey(username)) {
            return userDetailsCache.get(username);
        }
        
        User user = this.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Không tìm thấy người dùng: " + username);
        }
        
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // Xử lý roles
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (Role role : user.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            }
        } else {
            // Nếu không có role, gán mặc định ROLE_USER
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), authorities);
        
        // Lưu vào cache
        userDetailsCache.put(username, userDetails);
        
        return userDetails;
    }
    
    @Override
    @CacheEvict(value = "users", key = "#user.id")
    public void updateAvatar(User user, MultipartFile avatar) {
        try {
            if (avatar != null && !avatar.isEmpty()) {
                // Xóa avatar cũ trên Cloudinary nếu có
                if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                    // Lấy public_id từ URL
                    String publicId = extractPublicIdFromUrl(user.getAvatar());
                    if (publicId != null) {
                        try {
                            // Thử xóa ảnh cũ
                            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                        } catch (Exception e) {
                            // Nếu xóa thất bại, chỉ log lỗi và tiếp tục
                            System.err.println("Failed to delete old avatar: " + e.getMessage());
                        }
                    }
                }
                
                // Tải avatar mới lên với nén hình ảnh
                Map uploadResult = cloudinary.uploader().upload(
                    avatar.getBytes(),
                    ObjectUtils.asMap(
                        "folder", "ecommerce/avatars",
                        "resource_type", "auto",
                        "quality", "auto:good"  // Tự động điều chỉnh chất lượng để tối ưu hóa
                    )
                );
                
                // Cập nhật URL mới
                user.setAvatar(uploadResult.get("secure_url").toString());
                
                // Cập nhật user trong database
                userRepository.update(user);
                
                // Xóa cache
                userDetailsCache.remove(user.getUsername());
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể cập nhật avatar: " + e.getMessage());
        }
    }
    
    @Override
    @CacheEvict(value = "users", key = "#user.id")
    public void changePassword(User user, String newPassword) {
        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu mới không được để trống");
        }
        
        // Kiểm tra độ mạnh của mật khẩu
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự");
        }
        
        // Mã hóa mật khẩu mới
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        
        // Cập nhật user
        userRepository.update(user);
        
        // Xóa cache
        userDetailsCache.remove(user.getUsername());
    }
    
    // Phương thức trợ giúp để lấy public_id từ Cloudinary URL
    private String extractPublicIdFromUrl(String url) {
        try {
            if (url == null || url.isEmpty()) {
                return null;
            }
            
            // Format của URL Cloudinary: https://res.cloudinary.com/cloudname/image/upload/v12345/folder/filename.ext
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                return null;
            }
            
            String path = parts[1];
            
            // Bỏ phiên bản (v12345) nếu có
            if (path.matches("v\\d+/.*")) {
                path = path.replaceFirst("v\\d+/", "");
            }
            
            // Bỏ phần mở rộng tệp
            int lastDotIndex = path.lastIndexOf('.');
            if (lastDotIndex > 0) {
                path = path.substring(0, lastDotIndex);
            }
            
            return path; // Đây là public_id
        } catch (Exception e) {
            System.err.println("Failed to extract public_id: " + e.getMessage());
            return null;
        }
    }
}