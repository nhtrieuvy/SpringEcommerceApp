
package com.ecommerce.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.List;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

/**
 *
 * @author nhanh
 */
@Configuration
@EnableWebMvc
@EnableTransactionManagement
@ComponentScan(basePackages = {
        "com.ecommerce.controllers",
        "com.ecommerce.repositories",
        "com.ecommerce.services"
})

public class WebAppContextConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("home");
        registry.addViewController("/admin").setViewName("admin/dashboard");
    }

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    } 

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        
        org.springframework.http.converter.ByteArrayHttpMessageConverter byteArrayConverter = new org.springframework.http.converter.ByteArrayHttpMessageConverter();

        List<org.springframework.http.MediaType> byteArrayMediaTypes = new java.util.ArrayList<>();
        byteArrayMediaTypes.add(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
        byteArrayMediaTypes.add(org.springframework.http.MediaType
                .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        byteArrayConverter.setSupportedMediaTypes(byteArrayMediaTypes);

        converters.add(byteArrayConverter);

        
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();

        
        List<org.springframework.http.MediaType> supportedMediaTypes = new java.util.ArrayList<>();

        
        supportedMediaTypes.add(org.springframework.http.MediaType.APPLICATION_JSON);

        
        supportedMediaTypes.add(new org.springframework.http.MediaType(
                org.springframework.http.MediaType.APPLICATION_JSON.getType(),
                org.springframework.http.MediaType.APPLICATION_JSON.getSubtype(),
                java.nio.charset.StandardCharsets.UTF_8));

        
        supportedMediaTypes.add(org.springframework.http.MediaType.TEXT_PLAIN);

        supportedMediaTypes.add(org.springframework.http.MediaType.TEXT_HTML);

        
        supportedMediaTypes.add(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

        jsonConverter.setSupportedMediaTypes(supportedMediaTypes);

        
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS);
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        jsonConverter.setObjectMapper(objectMapper);

        converters.add(jsonConverter);
    }

    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }

}
