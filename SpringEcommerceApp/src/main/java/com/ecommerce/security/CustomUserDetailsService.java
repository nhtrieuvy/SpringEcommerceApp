package com.ecommerce.security;

import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of Spring Security's UserDetailsService.
 * This service loads user-specific data and creates UserDetails object expected
 * by Spring Security.
 * Follows Single Responsibility Principle by focusing only on user
 * authentication details.
 */
@Service("customUserDetailsService")
@Primary
public class CustomUserDetailsService implements UserDetailsService {

    private final UserService userService;

    /**
     * Constructor injection for better testability and loose coupling.
     * 
     * @param userService The user service dependency
     */
    @Autowired
    public CustomUserDetailsService(UserService userService) {
        this.userService = userService;
    }

    /**
     * Loads the user by username and converts to UserDetails.
     * 
     * @param username The username to look up
     * @return UserDetails object for Spring Security
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Find user by username or email
        User user = userService.findByUsername(username);

        if (user == null) {
            // Try finding by email instead
            user = userService.findByEmail(username);
        }

        if (user == null) {
            throw new UsernameNotFoundException("Không tìm thấy người dùng với tên đăng nhập: " + username);
        }

        // Update last login time
        updateLastLogin(user);

        // Create UserPrincipal from our User entity
        return UserPrincipal.create(user);
    }

    /**
     * Updates the user's last login timestamp.
     * 
     * @param user The user whose last login time to update
     */
    @Transactional
    private void updateLastLogin(User user) {
        user.setLastLogin(new Date());
        userService.update(user);
    }
}
