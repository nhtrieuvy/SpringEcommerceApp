package com.ecommerce.configs;

import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class StartupAdminPasswordVerifier implements ApplicationRunner {
    private static final Logger logger = LoggerFactory.getLogger(StartupAdminPasswordVerifier.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.seed-admin-enabled:true}")
    private boolean seedEnabled;

    @Value("${app.security.seed-admin-password:password}")
    private String seedPassword;

    public StartupAdminPasswordVerifier(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }

        resetPasswordIfMismatch("admin");
        resetPasswordIfMismatch("admin2");
    }

    private void resetPasswordIfMismatch(String username) {
        User user = userService.findByUsername(username);
        if (user == null || user.getPassword() == null) {
            logger.warn("Seed admin skipped: user '{}' not found.", username);
            return;
        }

        boolean matches = passwordEncoder.matches(seedPassword, user.getPassword());
        if (!matches) {
            user.setPassword(passwordEncoder.encode(seedPassword));
            userService.update(user);
            logger.warn("Seed admin updated password for user '{}'", username);
        } else {
            logger.info("Seed admin password OK for user '{}'", username);
        }
    }
}
