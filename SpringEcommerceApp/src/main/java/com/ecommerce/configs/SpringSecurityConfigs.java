/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ecommerce.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Primary security configuration for traditional web application endpoints.
 * Extends BaseSecurityConfig to inherit common configurations.
 */
@Configuration
@EnableWebSecurity
@EnableTransactionManagement
@Order(2)
@ComponentScan(basePackages = {
        "com.ecommerce.controllers",
        "com.ecommerce.repositories",
        "com.ecommerce.services",
        "com.ecommerce.filters",
        "com.ecommerce.security"
})
public class SpringSecurityConfigs extends BaseSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SpringSecurityConfigs.class);
    @Autowired
    @Qualifier("customUserDetailsService")
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthenticationSuccessHandler adminAuthenticationSuccessHandler;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring Spring Security Filter Chain");
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(c -> c.disable())
                .userDetailsService(userDetailsService).securityMatcher("/**") // Applies to all URLs except /api/**
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/", "/login", "/js/**", "/css/**", "/images/**", "/static/**").permitAll()
                        .requestMatchers("/admin/**").hasAuthority("ADMIN")
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .successHandler(adminAuthenticationSuccessHandler)
                        .failureUrl("/login?error=true")
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll())
                .exceptionHandling(ex -> ex.accessDeniedPage("/login"));

        return http.build();
    }

    @Bean
    public HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
        return new HandlerMappingIntrospector();
    } // CorsConfigurationSource is now inherited from BaseSecurityConfig

    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
}
