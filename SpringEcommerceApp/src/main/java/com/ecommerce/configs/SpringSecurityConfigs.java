
package com.ecommerce.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.PortResolver;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.web.cors.CorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Configuration
@EnableWebSecurity
@Order(2)
public class SpringSecurityConfigs {
    private static final Logger logger = LoggerFactory.getLogger(SpringSecurityConfigs.class);
    @Autowired
    @Qualifier("customUserDetailsService")
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthenticationSuccessHandler adminAuthenticationSuccessHandler;

    private final CorsConfigurationSource corsConfigurationSource;

    public SpringSecurityConfigs(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring Spring Security Filter Chain");
                http.cors(cors -> cors.configurationSource(corsConfigurationSource))
                        .csrf(c -> c.disable())
                        .authenticationProvider(authenticationProvider())
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
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedPage("/login"))
                .requestCache(cache -> cache.requestCache(requestCache()));

        return http.build();
    }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(userDetailsService);
                provider.setPasswordEncoder(passwordEncoder);
                return provider;
        }

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Bean
        public AuthenticationEntryPoint authenticationEntryPoint() {
                RedirectStrategy strategy = redirectStrategy();
                return (request, response, authException) ->
                                strategy.sendRedirect(request, response, request.getContextPath() + "/login");
        }

        @Bean
        public RedirectStrategy redirectStrategy() {
                DefaultRedirectStrategy strategy = new DefaultRedirectStrategy();
                strategy.setContextRelative(true);
                return strategy;
        }

        @Bean
        public HttpSessionRequestCache requestCache() {
                HttpSessionRequestCache cache = new HttpSessionRequestCache();
                cache.setPortResolver(portResolver());
                return cache;
        }

        @Bean
        public PortResolver portResolver() {
                return request -> 8080;
        }

}
