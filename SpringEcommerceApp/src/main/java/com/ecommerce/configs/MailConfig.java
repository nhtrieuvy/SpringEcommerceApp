package com.ecommerce.configs;

import java.util.Properties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {
    
    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;
    
    @Value("${spring.mail.port:587}")
    private int port;
    
    @Value("${spring.mail.username:nhanhgon24@gmail.com}")
    private String username;
    
    @Value("${spring.mail.password:ozxs stip hhfs amtr}")
    private String password;
    
    @Value("${spring.mail.properties.mail.smtp.auth:true}")
    private String auth;
    
    @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
    private String starttls;
    
    @Bean(name = "mailSender")
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        
        // Sử dụng thông tin đăng nhập Gmail đã cung cấp
        mailSender.setUsername("nhanhgon24@gmail.com");
        mailSender.setPassword("ozxs stip hhfs amtr");
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.debug", "true");
        
        return mailSender;
    }
}