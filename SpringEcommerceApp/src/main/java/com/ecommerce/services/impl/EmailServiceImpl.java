package com.ecommerce.services.impl;

import com.ecommerce.services.EmailService;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderDetail;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;

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

    @Override
    public void sendOrderConfirmationEmail(Order order) {
        try {
            String customerEmail = order.getUser().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                System.out.println("Customer email not found for order: " + order.getId());
                return;
            }

            String subject = "Xác nhận đơn hàng #" + order.getId() + " - EcommerceWebsite";
            String htmlContent = buildOrderConfirmationEmailHtml(order);

            sendHtmlMessage(customerEmail, subject, htmlContent);

            System.out.println("Order confirmation email sent to: " + customerEmail + " for order: " + order.getId());
        } catch (Exception e) {
            System.err.println("Error sending order confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void sendOrderStatusUpdateEmail(Order order, String oldStatus, String newStatus) {
        try {
            String customerEmail = order.getUser().getEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                System.out.println("Customer email not found for order: " + order.getId());
                return;
            }

            String subject = "Cập nhật trạng thái đơn hàng #" + order.getId() + " - EcommerceWebsite";
            String htmlContent = buildOrderStatusUpdateEmailHtml(order, oldStatus, newStatus);

            sendHtmlMessage(customerEmail, subject, htmlContent);

            System.out.println("Order status update email sent to: " + customerEmail + " for order: " + order.getId());
        } catch (Exception e) {
            System.err.println("Error sending order status update email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendHtmlMessage(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Error sending HTML email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email HTML: " + e.getMessage(), e);
        }
    }

    private String buildOrderConfirmationEmailHtml(Order order) {
        StringBuilder html = new StringBuilder();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

        html.append("<!DOCTYPE html>")
                .append("<html>")
                .append("<head>")
                .append("<meta charset='UTF-8'>")
                .append("<title>Xác nhận đơn hàng</title>")
                .append("<style>")
                .append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }")
                .append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }")
                .append(".header { background-color: #2e7d32; color: white; padding: 20px; text-align: center; }")
                .append(".content { background-color: #f9f9f9; padding: 20px; }")
                .append(".order-info { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2e7d32; }")
                .append(".item-table { width: 100%; border-collapse: collapse; margin: 15px 0; }")
                .append(".item-table th, .item-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }")
                .append(".item-table th { background-color: #f0f0f0; }")
                .append(".total { font-weight: bold; font-size: 18px; color: #2e7d32; }")
                .append(".footer { background-color: #333; color: white; padding: 15px; text-align: center; }")
                .append("</style>")
                .append("</head>")
                .append("<body>")
                .append("<div class='container'>")
                .append("<div class='header'>")
                .append("<h1>Xác nhận đơn hàng</h1>")
                .append("<p>Cảm ơn bạn đã đặt hàng tại EcommerceWebsite!</p>")
                .append("</div>")
                .append("<div class='content'>")
                .append("<div class='order-info'>")
                .append("<h2>Thông tin đơn hàng</h2>")
                .append("<p><strong>Mã đơn hàng:</strong> #").append(order.getId()).append("</p>")
                .append("<p><strong>Ngày đặt hàng:</strong> ").append(dateFormat.format(order.getOrderDate()))
                .append("</p>")
                .append("<p><strong>Trạng thái:</strong> ").append(getStatusText(order.getStatus())).append("</p>")
                .append("<p><strong>Khách hàng:</strong> ").append(order.getUser().getFullname()).append("</p>")
                .append("</div>");

        // Order items table
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            html.append("<h3>Chi tiết đơn hàng</h3>")
                    .append("<table class='item-table'>")
                    .append("<tr>")
                    .append("<th>Sản phẩm</th>")
                    .append("<th>Số lượng</th>")
                    .append("<th>Đơn giá</th>")
                    .append("<th>Thành tiền</th>")
                    .append("</tr>");

            for (OrderDetail detail : order.getOrderDetails()) {
                double itemTotal = detail.getPrice() * detail.getQuantity();
                html.append("<tr>")
                        .append("<td>").append(detail.getProduct().getName()).append("</td>")
                        .append("<td>").append(detail.getQuantity()).append("</td>")
                        .append("<td>").append(currencyFormat.format(detail.getPrice())).append("</td>")
                        .append("<td>").append(currencyFormat.format(itemTotal)).append("</td>")
                        .append("</tr>");
            }

            html.append("<tr class='total'>")
                    .append("<td colspan='3'>Tổng cộng:</td>")
                    .append("<td>").append(currencyFormat.format(order.getTotalAmount())).append("</td>")
                    .append("</tr>")
                    .append("</table>");
        }

        // Payment info
        if (order.getPayment() != null) {
            html.append("<div class='order-info'>")
                    .append("<h3>Thông tin thanh toán</h3>")
                    .append("<p><strong>Phương thức:</strong> ")
                    .append(getPaymentMethodText(order.getPayment().getPaymentMethod().toString())).append("</p>")
                    .append("<p><strong>Trạng thái thanh toán:</strong> ")
                    .append(getPaymentStatusText(order.getPayment().getStatus())).append("</p>")
                    .append("</div>");
        }

        html.append("<p>Bạn có thể theo dõi đơn hàng tại: <a href='").append(appUrl).append("/orders'>").append(appUrl)
                .append("/orders</a></p>")
                .append("<p>Cảm ơn bạn đã tin tùng và mua sắm tại EcommerceWebsite!</p>")
                .append("</div>")
                .append("<div class='footer'>")
                .append("<p>© 2024 EcommerceWebsite. Mọi quyền được bảo lưu.</p>")
                .append("<p>Email: ").append(fromEmail).append(" | Website: ").append(appUrl).append("</p>")
                .append("</div>")
                .append("</div>")
                .append("</body>")
                .append("</html>");

        return html.toString();
    }

    private String buildOrderStatusUpdateEmailHtml(Order order, String oldStatus, String newStatus) {
        StringBuilder html = new StringBuilder();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        html.append("<!DOCTYPE html>")
                .append("<html>")
                .append("<head>")
                .append("<meta charset='UTF-8'>")
                .append("<title>Cập nhật trạng thái đơn hàng</title>")
                .append("<style>")
                .append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }")
                .append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }")
                .append(".header { background-color: #2e7d32; color: white; padding: 20px; text-align: center; }")
                .append(".content { background-color: #f9f9f9; padding: 20px; }")
                .append(".status-update { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2e7d32; }")
                .append(".status-change { background-color: #e8f5e8; padding: 10px; margin: 10px 0; border-radius: 5px; }")
                .append(".footer { background-color: #333; color: white; padding: 15px; text-align: center; }")
                .append("</style>")
                .append("</head>")
                .append("<body>")
                .append("<div class='container'>")
                .append("<div class='header'>")
                .append("<h1>Cập nhật trạng thái đơn hàng</h1>")
                .append("</div>")
                .append("<div class='content'>")
                .append("<div class='status-update'>")
                .append("<h2>Đơn hàng #").append(order.getId()).append("</h2>")
                .append("<p><strong>Khách hàng:</strong> ").append(order.getUser().getFullname()).append("</p>")
                .append("<p><strong>Ngày đặt hàng:</strong> ").append(dateFormat.format(order.getOrderDate()))
                .append("</p>")
                .append("</div>")
                .append("<div class='status-change'>")
                .append("<h3>Thay đổi trạng thái</h3>")
                .append("<p><strong>Từ:</strong> ").append(getStatusText(oldStatus)).append("</p>")
                .append("<p><strong>Thành:</strong> ").append(getStatusText(newStatus)).append("</p>")
                .append("<p><strong>Thời gian:</strong> ").append(dateFormat.format(new java.util.Date()))
                .append("</p>")
                .append("</div>")
                .append("<p>Bạn có thể theo dõi đơn hàng tại: <a href='").append(appUrl).append("/orders'>")
                .append(appUrl).append("/orders</a></p>")
                .append("<p>Cảm ơn bạn đã tin tùng EcommerceWebsite!</p>")
                .append("</div>")
                .append("<div class='footer'>")
                .append("<p>© 2024 EcommerceWebsite. Mọi quyền được bảo lưu.</p>")
                .append("<p>Email: ").append(fromEmail).append(" | Website: ").append(appUrl).append("</p>")
                .append("</div>")
                .append("</div>")
                .append("</body>")
                .append("</html>");

        return html.toString();
    }

    private String getStatusText(String status) {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "Chờ xử lý";
            case "CONFIRMED":
                return "Đã xác nhận";
            case "PROCESSING":
                return "Đang xử lý";
            case "SHIPPED":
                return "Đã giao vận";
            case "DELIVERED":
                return "Đã giao hàng";
            case "CANCELLED":
                return "Đã hủy";
            case "RETURNED":
                return "Đã trả hàng";
            default:
                return status;
        }
    }

    private String getPaymentMethodText(String paymentMethod) {
        switch (paymentMethod.toUpperCase()) {
            case "CASH_ON_DELIVERY":
                return "Thanh toán khi nhận hàng";
            case "CREDIT_CARD":
                return "Thẻ tín dụng";
            case "BANK_TRANSFER":
                return "Chuyển khoản ngân hàng";
            case "PAYPAL":
                return "PayPal";
            case "MOMO":
                return "MoMo";
            default:
                return paymentMethod;
        }
    }

    private String getPaymentStatusText(String status) {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "Chờ thanh toán";
            case "COMPLETED":
                return "Đã thanh toán";
            case "FAILED":
                return "Thanh toán thất bại";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    }
}