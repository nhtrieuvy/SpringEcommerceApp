
package com.ecommerce.configs;

import jakarta.servlet.MultipartConfigElement;
import jakarta.servlet.ServletRegistration;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;
import jakarta.servlet.Filter;


public class DispatcherServletInit extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[] {
                HibernateConfigs.class,
                SpringSecurityConfigs.class,
                JwtSecurityConfig.class,
                ThymeleafConfig.class,
                MailConfig.class,
                CacheConfig.class,
                PaypalConfig.class,
                MomoConfig.class,
        };
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[] {
                WebAppContextConfig.class
        };
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] { "/" };
    }

    @Override
    protected Filter[] getServletFilters() {
        return new Filter[] {}; 
    }

    
    @Override
    protected void customizeRegistration(ServletRegistration.Dynamic registration) {
        
        String location = "/";

  
        MultipartConfigElement multipartConfig = new MultipartConfigElement(
                location,
                5 * 1024 * 1024,
                25 * 1024 * 1024,
                0
        );

        registration.setMultipartConfig(multipartConfig);
    }
}
