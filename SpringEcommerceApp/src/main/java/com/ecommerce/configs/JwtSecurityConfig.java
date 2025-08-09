package com.ecommerce.configs;

import com.ecommerce.filters.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@Order(1)
public class JwtSecurityConfig extends BaseSecurityConfig {
        private static final Logger logger = LoggerFactory.getLogger(JwtSecurityConfig.class);

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain jwtFilterChain(HttpSecurity http) throws Exception {
                logger.info("Configuring JWT security filter chain");

                http
                                .securityMatcher("/api/**")
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/api/login", "/api/login/google",
                                                                "/api/login/facebook", "/api/register")
                                                .permitAll()
                                                .requestMatchers("/api/password/forgot", "/api/password/reset",
                                                                "/api/password/reset/validate")
                                                .permitAll()
                                                .requestMatchers("/api/products/**", "/api/categories/**",
                                                                "/api/review/product/**",
                                                                "/api/review/reply/**")
                                                .permitAll()
                                                .requestMatchers(
                                                                "/api/payments/momo/return/**",
                                                                "/api/payments/momo/notify",
                                                                "/api/payments/paypal/return/**")
                                                .permitAll()

                                                .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "STAFF")
                                                .requestMatchers("/api/seller/requests/**")
                                                .hasAnyAuthority("ADMIN", "STAFF")
                                                .requestMatchers("/api/seller/register").hasAnyAuthority("USER")
                                                .requestMatchers("api/seller/request-status").permitAll()
                                                .requestMatchers("/api/seller/**").hasAnyAuthority("SELLER", "ADMIN")
                                                .requestMatchers("/api/**").authenticated())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        logger.error("Unauthorized error: {}",
                                                                        authException.getMessage());
                                                        response.setContentType("application/json;charset=UTF-8");
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.getWriter()
                                                                        .write("{\"error\":\"Unauthorized\",\"message\":\"Authentication failed: "
                                                                                        + authException.getMessage()
                                                                                        + "\"}");
                                                }));

                logger.info("JWT security filter chain configured successfully");
                return http.build();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }
}