package com.ecommerce.services;

import com.ecommerce.pojo.Order;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
    void sendPasswordResetEmail(String to, String token);
    void sendOrderConfirmationEmail(Order order);
    void sendOrderStatusUpdateEmail(Order order, String oldStatus, String newStatus);
}