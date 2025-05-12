package com.ecommerce.filters;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Đảm bảo filter này chạy trước các filter khác
public class SimpleCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // Log request để debug
        System.out.println("SimpleCorsFilter processing: " + request.getMethod() + " " + request.getRequestURI());

        // Thêm các header CORS cần thiết
        response.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        // Xử lý đặc biệt cho OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println("Handling OPTIONS request");
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            // Tiếp tục chuỗi filter
            chain.doFilter(req, res);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("SimpleCorsFilter initialized");
    }

    @Override
    public void destroy() {
        System.out.println("SimpleCorsFilter destroyed");
    }
}