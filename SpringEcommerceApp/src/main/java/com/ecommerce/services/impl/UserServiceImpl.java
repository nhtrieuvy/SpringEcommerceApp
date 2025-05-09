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
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.hibernate.Hibernate;

@Service("userServiceImpl")
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private SessionFactory sessionFactory;
    
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
            
            user.setAuthProvider("LOCAL"); // Đặt auth provider là LOCAL cho đăng ký thông thường
            
            // Thiết lập role USER cho người dùng mới
            Session session = sessionFactory.getCurrentSession();
            Query<Role> query = session.createQuery("FROM Role WHERE name = :name", Role.class);
            query.setParameter("name", "USER");
            Role userRole = query.uniqueResult();
            
            if (userRole == null) {
                // Nếu không tìm thấy, tạo role mới
                userRole = new Role();
                userRole.setName("USER");
                session.persist(userRole);
                session.flush(); // Đảm bảo role được lưu và có ID
            }
            
            // Lưu user trước để có ID
            User savedUser = userRepository.addUser(user);
            
            // Gán role cho user qua Hibernate
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            savedUser.setRoles(roles);
            userRepository.update(savedUser); // Hibernate sẽ tự insert vào user_roles
            
            return savedUser;
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
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) {
        User user = userRepository.findById(id);
        if (user != null) {
            try {
                // Xóa cache trước
                userDetailsCache.remove(user.getUsername());
                
                System.out.println("Xóa user với ID=" + id);
                
                // Xóa các bản ghi liên quan trong user_roles
                Session session = sessionFactory.getCurrentSession();
                int deleteCount = session.createNativeQuery("DELETE FROM user_roles WHERE user_id = :userId")
                        .setParameter("userId", id)
                        .executeUpdate();
                System.out.println("Đã xóa " + deleteCount + " bản ghi từ user_roles");
                
                // Sau đó xóa user
                userRepository.delete(id);
                System.out.println("Đã xóa user thành công");
            } catch (Exception e) {
                System.err.println("Lỗi khi xóa user: " + e.getMessage());
                e.printStackTrace();
                throw e; // Re-throw để xử lý ở mức cao hơn
            }
        } else {
            System.out.println("Không tìm thấy user với ID=" + id);
        }
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
    
    @Override
    public User addUser(User user) {
        try {
            // Kiểm tra username và email
            String username = user.getUsername();
            String email = user.getEmail();
            
            if (username == null || username.trim().isEmpty() || 
                email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Username và email không được để trống");
            }
            
            // Kiểm tra xem username và email đã tồn tại chưa
            if (userRepository.findByUsername(username) != null) {
                throw new IllegalArgumentException("Username đã tồn tại");
            }
            
            if (userRepository.findByEmail(email) != null) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            
            // Đảm bảo rằng password đã được mã hóa
            if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            
            // Thiết lập auth provider nếu chưa có
            if (user.getAuthProvider() == null) {
                user.setAuthProvider("LOCAL");
            }
            
            // Lưu user để có ID
            User savedUser = userRepository.addUser(user);
            
            // Lấy hoặc tạo role USER
            Session session = sessionFactory.getCurrentSession();
            Role userRole = null;
            
            try {
                Query<Role> query = session.createQuery("FROM Role WHERE name = :name", Role.class);
                query.setParameter("name", "USER");
                userRole = query.uniqueResult();
                
                if (userRole == null) {
                    userRole = new Role();
                    userRole.setName("USER");
                    session.persist(userRole);
                    session.flush();
                }
                
                // Gán role cho user qua Hibernate
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                savedUser.setRoles(roles);
                userRepository.update(savedUser); // Hibernate sẽ tự insert vào user_roles
            } catch (Exception e) {
                System.err.println("Lỗi khi xử lý role: " + e.getMessage());
                e.printStackTrace();
            }
            
            return savedUser;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo người dùng: " + e.getMessage(), e);
        }
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

    // Phương thức mới để thêm role mặc định cho user
    private User addDefaultRole(User user) {
        try {
            // Sử dụng session hiện tại nếu có
            Session session = sessionFactory.getCurrentSession();
            
            // Truy vấn tìm role USER
            Query<Role> query = session.createQuery("FROM Role WHERE name = :name", Role.class);
            query.setParameter("name", "USER");
            Role userRole = query.uniqueResult();
            
            if (userRole == null) {
                // Nếu không có role USER, tạo mới
                userRole = new Role();
                userRole.setName("USER");
                session.persist(userRole);
            }
            
            // Tạo set roles nếu chưa có
            if (user.getRoles() == null) {
                user.setRoles(new HashSet<>());
            } else {
                // Đảm bảo collection đã được khởi tạo
                Hibernate.initialize(user.getRoles());
            }
            
            // Thêm role vào user
            user.getRoles().add(userRole);
            System.out.println("Đã thêm role USER vào user: " + user.getUsername());
            
            return user;
        } catch (Exception e) {
            System.err.println("Lỗi khi thêm role mặc định: " + e.getMessage());
            e.printStackTrace();
            return user; // Vẫn trả về user để tiếp tục quá trình
        }
    }
      @Override
    public void addRoleToUser(User user, Role role) {
        // Clear user cache to ensure updated roles are reflected
        userDetailsCache.remove(user.getUsername());
        
        // Check if user already has this role
        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }
        
        // // Ensure we have a complete user object with password
        // if (user.getPassword() == null) {
        //     // Get a fresh copy of the user with all fields from the database
        //     User refreshedUser = userRepository.findById(user.getId());
        //     if (refreshedUser != null && refreshedUser.getPassword() != null) {
        //         user.setPassword(refreshedUser.getPassword());
        //     } else {
        //         throw new RuntimeException("Không thể cập nhật quyền: password của user là null");
        //     }
        // }
        
        // Add the role to the user's role set
        user.getRoles().add(role);
        
        // Update the user in the database
        userRepository.update(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findByActiveStatus(boolean isActive) {
        return userRepository.findByActiveStatus(isActive);
    }
      @Override
    public void removeRoleFromUser(User user, Role role) {
        Set<Role> roles = user.getRoles();
        roles.remove(role);
        user.setRoles(roles);
        userRepository.update(user);
        
        // Xóa cache
        userDetailsCache.remove(user.getUsername());
    }
    
    @Override
    public void clearUserCache(String username) {
        if (username != null) {
            userDetailsCache.remove(username);
            System.out.println("Cleared cache for user: " + username);
        }
    }
}