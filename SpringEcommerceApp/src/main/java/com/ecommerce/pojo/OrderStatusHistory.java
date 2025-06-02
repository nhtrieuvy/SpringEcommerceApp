package com.ecommerce.pojo;

import java.util.Date;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "order_status_history")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class OrderStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({ "statusHistory", "orderDetails", "payment", "hibernateLazyInitializer", "handler" })
    private Order order;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "created_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({ "orders", "password", "role", "hibernateLazyInitializer", "handler" })
    private User createdBy;    public OrderStatusHistory() {
    }

    public OrderStatusHistory(Order order, String status, String note, User createdBy) {
        this.order = order;
        this.status = status;
        this.note = note;
        this.createdBy = createdBy;
        this.createdAt = new Date();
    }

    // Constructor for DTO-like usage (without relationships)
    public OrderStatusHistory(Long id, String status, String note, Date createdAt) {
        this.id = id;
        this.status = status;
        this.note = note;
        this.createdAt = createdAt;
        this.order = null;
        this.createdBy = null;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}
