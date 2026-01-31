package com.ecommerce.pojo;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import java.util.Date;
import java.util.Set;

/**
 * Entity representing an order in the e-commerce system.
 * An order contains details about the purchase, customer, payment, and
 * tracking
 * information.
 * It maintains bidirectional relationships with OrderDetail, Payment, and
 * OrderStatusHistory entities.
 */
@Entity
@Table(name = "orders")

@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "orders", "password", "role" })
    private User user;
    @Column(name = "order_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date orderDate;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;
    
    @Column(name = "shipping_fee")
    private Double shippingFee;
    
    @Column(length = 255)
    private String address;
    
    @Column(name = "shipping_address", length = 255)
    private String shippingAddress;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST,
            CascadeType.MERGE }, orphanRemoval = true)
    @Cache(usage = CacheConcurrencyStrategy.READ_ONLY)
    @JsonManagedReference
    private Set<OrderDetail> orderDetails;

    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIgnoreProperties("order")
    private Payment payment;    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIgnoreProperties("order")
    @JsonIgnore
    private Set<OrderStatusHistory> statusHistory;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTotalAmount() {
        return totalAmount;
    }    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public Double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Set<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(Set<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Set<OrderStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(Set<OrderStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
    }

    /**
     * Helper method to add an order detail and maintain the bidirectional
     * relationship
     * 
     * @param orderDetail The order detail to add to this order
     */
    public void addOrderDetail(OrderDetail orderDetail) {
        if (orderDetails == null) {
            orderDetails = new java.util.HashSet<>();
        }
        orderDetails.add(orderDetail);
        orderDetail.setOrder(this);
    }

    /**
     * Helper method to remove an order detail and maintain the bidirectional
     * relationship
     * 
     * @param orderDetail The order detail to remove from this order
     */
    public void removeOrderDetail(OrderDetail orderDetail) {
        if (orderDetails != null) {
            orderDetails.remove(orderDetail);
            orderDetail.setOrder(null);
        }
    }

    /**
     * Helper method to set payment and maintain the bidirectional relationship
     * 
     * @param payment The payment to associate with this order
     */
    public void setPaymentWithRelationship(Payment payment) {
        this.payment = payment;
        if (payment != null) {
            payment.setOrder(this);
        }
    }

    /**
     * Helper method to add status history and maintain the bidirectional
     * relationship
     * 
     * @param history The status history to add to this order
     */
    public void addStatusHistory(OrderStatusHistory history) {
        if (statusHistory == null) {
            statusHistory = new java.util.HashSet<>();
        }
        statusHistory.add(history);
        history.setOrder(this);
    }

    /**
     * Calculate and update the total amount of the order based on the order details
     * 
     * @return The calculated total amount
     */
    public double calculateTotalAmount() {
        if (orderDetails == null || orderDetails.isEmpty()) {
            this.totalAmount = 0.0;
            return 0.0;
        }

        double total = orderDetails.stream()
                .mapToDouble(detail -> detail.getPrice() * detail.getQuantity())
                .sum();

        this.totalAmount = total;
        return total;
    }

    /**
     * Checks if the order has any items in it
     * 
     * @return True if the order has details, false otherwise
     */
    public boolean hasItems() {
        return orderDetails != null && !orderDetails.isEmpty();
    }

    /**
     * Get the latest status history entry
     * 
     * @return The most recent OrderStatusHistory object or null if none exists
     */
    public OrderStatusHistory getLatestStatusHistory() {
        if (statusHistory == null || statusHistory.isEmpty()) {
            return null;
        }

        return statusHistory.stream()
                .max((h1, h2) -> h1.getCreatedAt().compareTo(h2.getCreatedAt()))
                .orElse(null);
    }

}
