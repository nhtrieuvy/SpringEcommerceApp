package com.ecommerce.configs;

import org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer;


/**
 * Khởi tạo Spring Security, tương đương với khai báo trong web.xml.
 * Lớp này đảm bảo DelegatingFilterProxy của Spring Security được đăng ký với container.
 */
public class SecurityWebApplicationInitializer extends AbstractSecurityWebApplicationInitializer {
    
}