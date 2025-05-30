package com.ecommerce.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AdminAuthenticationSuccessHandler implements AuthenticationSuccessHandler {    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        // Kiểm tra xem người dùng có quyền ADMIN không
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"));
        
        if (isAdmin) {
            response.sendRedirect(request.getContextPath() + "/admin");
        } else {
            // Đăng xuất và chuyển về trang login với thông báo lỗi
            request.getSession().invalidate();
            response.sendRedirect(request.getContextPath() + "/login?error=true");
        }
    }
}
