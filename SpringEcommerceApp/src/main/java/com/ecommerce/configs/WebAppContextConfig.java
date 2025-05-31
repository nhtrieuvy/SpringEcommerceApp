/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
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
    } // Thêm cấu hình hỗ trợ JSON message converter

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // Add ByteArrayHttpMessageConverter for Excel files first
        org.springframework.http.converter.ByteArrayHttpMessageConverter byteArrayConverter = new org.springframework.http.converter.ByteArrayHttpMessageConverter();

        List<org.springframework.http.MediaType> byteArrayMediaTypes = new java.util.ArrayList<>();
        byteArrayMediaTypes.add(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
        byteArrayMediaTypes.add(org.springframework.http.MediaType
                .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        byteArrayConverter.setSupportedMediaTypes(byteArrayMediaTypes);

        converters.add(byteArrayConverter);

        // Add JSON converter
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();

        // Thêm nhiều content type hỗ trợ
        List<org.springframework.http.MediaType> supportedMediaTypes = new java.util.ArrayList<>();

        // Support for standard application/json
        supportedMediaTypes.add(org.springframework.http.MediaType.APPLICATION_JSON);

        // Support for application/json;charset=UTF-8
        supportedMediaTypes.add(new org.springframework.http.MediaType(
                org.springframework.http.MediaType.APPLICATION_JSON.getType(),
                org.springframework.http.MediaType.APPLICATION_JSON.getSubtype(),
                java.nio.charset.StandardCharsets.UTF_8));

        // Support for text/plain (some clients might send JSON with this content type)
        supportedMediaTypes.add(org.springframework.http.MediaType.TEXT_PLAIN);

        // Support for text/html (in case browser sends form data)
        supportedMediaTypes.add(org.springframework.http.MediaType.TEXT_HTML);

        // Support for generic form submission content type
        supportedMediaTypes.add(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

        jsonConverter.setSupportedMediaTypes(supportedMediaTypes);

        // Cấu hình ObjectMapper để xử lý circular references
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
