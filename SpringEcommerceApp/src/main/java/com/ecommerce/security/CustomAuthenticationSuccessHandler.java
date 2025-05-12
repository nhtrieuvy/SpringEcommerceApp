package com.ecommerce.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Set;

/**
 * Custom authentication success handler to redirect users based on their roles.
 * Follows Single Responsibility Principle by focusing only on redirect logic after successful authentication.
 */
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        // Get user roles
        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());
        
        // Log authentication information
        logger.info("User '{}' logged in with roles: {}", 
                authentication.getName(), roles);
        
        // Determine redirect URL based on roles and request context path
        String redirectUrl = determineTargetUrl(request, roles);
        logger.info("Redirecting to: {}", redirectUrl);
        
        // Perform the redirect
        response.sendRedirect(redirectUrl);
    }    /**
     * Determine the target URL based on user roles
     * 
     * @param request The current HttpServletRequest to get context path
     * @param roles The user's roles
     * @return The URL to redirect to
     */
    private String determineTargetUrl(HttpServletRequest request, Set<String> roles) {
        // Get the context path dynamically to ensure it works in any environment
        String contextPath = request.getContextPath();
        logger.info("Current context path: {}", contextPath);
        
        if (roles.contains("ADMIN")) {
            return contextPath + "/admin"; // Admin dashboard with context path
        } else {
            // We want only admins, but in case someone else logs in, redirect to login page
            return contextPath + "/login";
        }
    }
}
