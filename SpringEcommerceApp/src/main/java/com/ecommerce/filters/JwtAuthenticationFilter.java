package com.ecommerce.filters;

import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;
import com.ecommerce.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Cho phép request OPTIONS đi qua mà không kiểm tra JWT
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Kiểm tra xem có Authorization header bắt đầu bằng "Bearer " không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Lấy token JWT từ header (bỏ "Bearer " ở đầu)
        jwt = authHeader.substring(7);
        try {
            // Kiểm tra xem token có hợp lệ không và lấy username từ token - sử dụng phương thức static
            username = JwtUtils.extractUsername(jwt);
            
            // Nếu có username và chưa có authentication trong SecurityContext
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Lấy thông tin user từ database
                User user = userService.findByUsername(username);
                
                // Nếu token hợp lệ, tạo authentication - sử dụng phương thức static
                if (JwtUtils.validateToken(jwt, username)) {
                    UserDetails userDetails = userService.loadUserByUsername(username);
                    
                    UsernamePasswordAuthenticationToken authToken = 
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null, 
                                    userDetails.getAuthorities()
                            );
                    
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    
                    // Đặt authentication vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log error nhưng không ném exception để filter chain tiếp tục
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}