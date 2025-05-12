package com.ecommerce.filters;

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
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Thêm CORS headers vào response
        response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        // 1. Cho phép request OPTIONS đi qua mà không kiểm tra JWT
        if (request.getMethod().equals("OPTIONS")) {
            System.out.println("OPTIONS request detected, skipping JWT authentication");
            response.setStatus(HttpServletResponse.SC_OK);
            return; // Chú ý: trả về ngay lập tức, không tiếp tục filter chain cho OPTIONS
        }

        System.out.println(
                "JwtAuthenticationFilter processing request: " + request.getMethod() + " " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + authHeader);

        // 2. Nếu không có header Authorization hoặc không bắt đầu bằng "Bearer ", bỏ
        // qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No JWT token found, continue filter chain");
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Lấy token JWT từ header (bỏ "Bearer " ở đầu)
        try {
            String jwt = authHeader.substring(7);
            String username = JwtUtils.extractUsername(jwt);
            System.out.println("Extracted username from token: " + username);

            // 4. Kiểm tra username và authentication trong context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 5. Lấy thông tin user từ database
                UserDetails userDetails = userService.loadUserByUsername(username);

                // 6. Xác thực token
                if (userDetails != null && JwtUtils.validateToken(jwt, username)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // 7. Đặt authentication vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext for user: " + username);

                    // 8. Thêm attribute username vào request
                    request.setAttribute("jwt_username", username);
                } else {
                    System.out.println("JWT validation failed or user not found");
                }
            }
        } catch (Exception e) {
            System.out.println("Error processing JWT token: " + e.getMessage());
            e.printStackTrace();
        }

        // 9. Tiếp tục filter chain
        filterChain.doFilter(request, response);

        // 10. Kiểm tra lại xác thực sau khi xử lý
        System.out.println("After filter chain, authentication: " +
                (SecurityContextHolder.getContext().getAuthentication() != null
                        ? SecurityContextHolder.getContext().getAuthentication().getName()
                        : "null"));
    }

}