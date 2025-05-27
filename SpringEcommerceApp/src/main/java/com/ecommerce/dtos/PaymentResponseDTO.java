package com.ecommerce.dtos;

import com.ecommerce.pojo.PaymentMethod;
import java.util.Date;

public class PaymentResponseDTO {
    private Long paymentId;
    private Long orderId;
    private PaymentMethod paymentMethod;
    private double amount;
    private String status;
    private String transactionId;
    private Date paymentDate;
    private String message;
    private String redirectUrl; // For PayPal approval URL

    public PaymentResponseDTO() {
    }

    public PaymentResponseDTO(Long paymentId, Long orderId, PaymentMethod paymentMethod, double amount, String status, String transactionId, Date paymentDate, String message, String redirectUrl) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.status = status;
        this.transactionId = transactionId;
        this.paymentDate = paymentDate;
        this.message = message;
        this.redirectUrl = redirectUrl;
    }

    public PaymentResponseDTO(Long paymentId, Long orderId, PaymentMethod paymentMethod, double amount, String status, String transactionId, Date paymentDate, String message) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.status = status;
        this.transactionId = transactionId;
        this.paymentDate = paymentDate;
        this.message = message;
    }

    // Getters and Setters

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
}
