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

        logger.debug("JwtAuthenticationFilter processing request: {} {}",
            request.getMethod(), request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", authHeader);

        // 2. Nếu không có header Authorization hoặc không bắt đầu bằng "Bearer ", bỏ
        // qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No JWT token found, continue filter chain");
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Lấy token JWT từ header (bỏ "Bearer " ở đầu)
        try {
            String jwt = authHeader.substring(7);
            String username = JwtUtils.extractUsername(jwt);
            logger.debug("Extracted username from token: {}", username);

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
                    logger.debug("Authentication set in SecurityContext for user: {}", username);

                    // 8. Thêm attribute username vào request
                    request.setAttribute("jwt_username", username);
                } else {
                    logger.warn("JWT validation failed or user not found");
                }
            }
        } catch (Exception e) {
            logger.error("Error processing JWT token", e);
        }

        // 9. Tiếp tục filter chain
        filterChain.doFilter(request, response);

        // 10. Kiểm tra lại xác thực sau khi xử lý
        logger.debug("After filter chain, authentication: {}",
            SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "null");
    }

}