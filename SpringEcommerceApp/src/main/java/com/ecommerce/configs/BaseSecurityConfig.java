package com.ecommerce.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;

/**
 * Base security configuration class that holds common configurations
 * including Cloudinary setup and CORS configuration
 */
@Configuration
public class BaseSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(BaseSecurityConfig.class);

    /**
     * Creates and configures a Cloudinary instance for file uploads
     * @return a configured Cloudinary instance
     */
    @Bean
    public Cloudinary cloudinary() {
        logger.info("Configuring Cloudinary");
        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dd0q3guu9",
                "api_key", "867579141935144",
                "api_secret", "lTIKfHjxzWqaHk9hn8GptW6owIE",
                "secure", true));
        logger.info("Cloudinary configuration completed");
        return cloudinary;
    }

    /**
     * Configures CORS settings for the application
     * @return a configured CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.info("Configuring CORS");

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        // Thêm các headers liên quan đến Cross-Origin-Opener-Policy
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        headers.add("Cross-Origin-Embedder-Policy", "require-corp");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        logger.info("CORS configuration completed");
        return source;
    }
}
