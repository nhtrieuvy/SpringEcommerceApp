package com.ecommerce.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.ArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;


@Configuration
public class BaseSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(BaseSecurityConfig.class);

    @Value("${cloudinary.cloud_name:}")
    private String cloudinaryCloudName;

    @Value("${cloudinary.api_key:}")
    private String cloudinaryApiKey;

    @Value("${cloudinary.api_secret:}")
    private String cloudinaryApiSecret;

    @Value("${app.url:}")
    private String appUrl;

    
    @Bean
    public Cloudinary cloudinary() {
        logger.info("Configuring Cloudinary");
        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudinaryCloudName,
                "api_key", cloudinaryApiKey,
                "api_secret", cloudinaryApiSecret,
                "secure", true));
        logger.info("Cloudinary configuration completed");
        return cloudinary;
    }

   
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.info("Configuring CORS");

        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOrigins = new ArrayList<>();
        allowedOrigins.add("http://localhost:3000");
        allowedOrigins.add("https://localhost:3000");
        if (appUrl != null && !appUrl.isBlank()) {
            allowedOrigins.add(appUrl);
        }
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        headers.add("Cross-Origin-Embedder-Policy", "require-corp");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        logger.info("CORS configuration completed");
        return source;
    }
}
