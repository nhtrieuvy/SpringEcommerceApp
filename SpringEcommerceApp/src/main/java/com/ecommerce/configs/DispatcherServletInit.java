/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ecommerce.configs;

import jakarta.servlet.MultipartConfigElement;
import jakarta.servlet.ServletRegistration;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

/**
 *
 * @author nhanh
 */
public class DispatcherServletInit extends AbstractAnnotationConfigDispatcherServletInitializer{

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{
            HibernateConfigs.class,
            SpringSecurityConfigs.class,
            JwtSecurityConfig.class,
            ThymeleafConfig.class
        };
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{
            WebAppContextConfig.class
        };
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] {"/"};
    }

    // Thêm cấu hình multipart cho file upload
    @Override
    protected void customizeRegistration(ServletRegistration.Dynamic registration) {
        // Tạo thư mục tạm thời để lưu file upload
        String location = "/";

        
        // Cấu hình các giá trị: vị trí lưu, kích thước tối đa file, kích thước tối đa request, ngưỡng kích thước lưu vào bộ nhớ
        MultipartConfigElement multipartConfig = new MultipartConfigElement(
                location, 
                5 * 1024 * 1024,   // 5MB kích thước tối đa file
                25 * 1024 * 1024,  // 25MB kích thước tối đa request
                0                   // ngưỡng kích thước lưu vào bộ nhớ (0 = tất cả)
        );
        
        registration.setMultipartConfig(multipartConfig);
    }
}
