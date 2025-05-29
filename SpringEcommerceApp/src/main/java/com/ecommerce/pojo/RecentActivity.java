package com.ecommerce.pojo;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.time.LocalDateTime;

/**
 * Entity representing recent activities in the admin dashboard.
 * This tracks various system activities like logins, orders, product additions, etc.
 */
@Entity
@Table(name = "recent_activity")
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class RecentActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType; // LOGIN, ORDER_CREATED, PRODUCT_ADDED, USER_REGISTERED, etc.
    
    @Column(name = "description", nullable = false, length = 500)
    private String description; // Human readable description
    
    @Column(name = "user_email", length = 100)
    private String userEmail; // Email of user who performed the action
    
    @Column(name = "user_name", length = 100)
    private String userName; // Name of user who performed the action
    
    @Column(name = "entity_id")
    private Long entityId; // ID of related entity (order ID, product ID, etc.)
    
    @Column(name = "entity_type", length = 50)
    private String entityType; // ORDER, PRODUCT, USER, etc.
      @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress; // IP address of the user
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
