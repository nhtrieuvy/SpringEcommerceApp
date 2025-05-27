package com.ecommerce.pojo;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.checkerframework.checker.units.qual.C;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Entity representing the payment information for an order in the e-commerce system.
 * Each Payment is associated with exactly one Order and includes details about
 * the payment method, amount, transaction status, and payment processor-specific information.
 * It maintains a one-to-one bidirectional relationship with the Order entity.
 */
@Entity
@Table(name = "payments")
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties("payment")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "payment_method") 
    private PaymentMethod paymentMethod; // cash, paypal, stripe, zalo pay, momo
    
    @Column(nullable = false)
    private double amount;
    
    @Column(nullable = false)
    private String status; // e.g., PENDING, COMPLETED, FAILED

    @Column(name = "transaction_id")
    private String transactionId; // For online payment gateway reference
    
    @Column(name = "payment_date")
    private java.util.Date paymentDate;

    // PayPal specific fields
    @Column(name = "paypal_payer_id")
    private String paypalPayerId;
    
    @Column(name = "paypal_capture_id")
    private String paypalCaptureId;    /**
     * Validates that all required fields are set and have reasonable values
     * @throws IllegalStateException if validation fails
     */
    public void validate() {
        if (order == null) {
            throw new IllegalStateException("Payment must be associated with an order");
        }
        
        if (paymentMethod == null) {
            throw new IllegalStateException("Payment method cannot be null");
        }
        
        if (amount <= 0) {
            throw new IllegalStateException("Payment amount must be greater than zero");
        }
        
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalStateException("Payment status cannot be empty");
        }
        
        if (paymentDate == null) {
            paymentDate = new java.util.Date(); // Set default to current date if missing
        }
    }

    // Explicit getter and setter methods to ensure compilation compatibility
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
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

    public java.util.Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(java.util.Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaypalPayerId() {
        return paypalPayerId;
    }

    public void setPaypalPayerId(String paypalPayerId) {
        this.paypalPayerId = paypalPayerId;
    }

    public String getPaypalCaptureId() {
        return paypalCaptureId;
    }

    public void setPaypalCaptureId(String paypalCaptureId) {
        this.paypalCaptureId = paypalCaptureId;
    }
}
