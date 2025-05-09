package com.ecommerce.services.impl;

import com.ecommerce.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    @Qualifier("mailSender")
    private JavaMailSender mailSender;
    
    @Value("${app.email.from:noreply@ecommerce.com}")
    private String fromEmail;
    
    @Value("${app.url:https://localhost:3000}")
    private String appUrl;

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Đặt lại mật khẩu EcommerceWebsite";
        String resetUrl = appUrl + "/reset-password?token=" + token;
        String message = "Để đặt lại mật khẩu, vui lòng nhấp vào liên kết sau:\n" + resetUrl + 
                         "\n\nLiên kết này sẽ hết hạn sau 24 giờ.";
        
        sendSimpleMessage(to, subject, message);
        
        // In thông tin cho mục đích debugging
        System.out.println("Password reset token for " + to + ": " + token);
        System.out.println("Reset URL: " + resetUrl);
    }
}