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
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Service("userServiceImpl")
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private Cloudinary cloudinary;

    @Override
    public User addUser(Map<String, String> params, MultipartFile avatar) {
        User user = new User();
        user.setUsername(params.get("username"));
        user.setEmail(params.get("email"));
        user.setPassword(passwordEncoder.encode(params.get("password")));
        // Xử lý role (tùy logic của bạn, ví dụ lấy role từ params hoặc gán mặc định)
        // ...

        // Upload avatar lên Cloudinary
        if (avatar != null && !avatar.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.emptyMap());
                user.setAvatar(uploadResult.get("secure_url").toString());
            } catch (IOException e) {
                user.setAvatar(null);
            }
        } else {
            user.setAvatar(null);
        }

        // Lưu user
        return userRepository.addUser(user);
    }

    @Override
    public boolean authenticate(String username, String password) {
        return this.userRepository.authenticate(username, password);
    }

    @Override
    public void update(User user) {
        userRepository.update(user);
    }

    @Override
    public void delete(Long id) {
        userRepository.delete(id);
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = this.findByUsername(username);
        if (u == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // Xử lý roles đúng cách
        if (u.getRoles() != null && !u.getRoles().isEmpty()) {
            for (Role role : u.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            }
        } else {
            // Nếu không có role, gán mặc định ROLE_USER
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(), authorities);
    }
}