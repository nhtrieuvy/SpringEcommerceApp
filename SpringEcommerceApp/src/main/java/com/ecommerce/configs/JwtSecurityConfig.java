package com.ecommerce.configs;

import com.ecommerce.filters.JwtAuthenticationFilter;
import com.ecommerce.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@Order(1)
public class JwtSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(JwtSecurityConfig.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain jwtFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring JWT security filter chain");

        http
                .securityMatcher("/api/**") // Chỉ áp dụng cho các request bắt đầu với /api/
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/login", "/api/login/google", "/api/login/facebook", "/api/register")
                        .permitAll()
                        .requestMatchers("/api/password/forgot", "/api/password/reset", "/api/password/reset/validate")
                        .permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "STAFF") // Cho phép ADMIN và STAFF
                                                                                            // truy cập API admin

                        .requestMatchers("/api/**").authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            logger.error("Unauthorized error: {}", authException.getMessage());
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter()
                                    .write("{\"error\":\"Unauthorized\",\"message\":\"Authentication failed: "
                                            + authException.getMessage() + "\"}");
                        }));

        logger.info("JWT security filter chain configured successfully");
        return http.build();
    }

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

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}