package com.ecommerce.pojo;

import java.util.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "review_sellers")
public class ReviewSeller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "seller_id")
    private Long sellerId;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Column(length = 1000)
    private String comment;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;

    // Constructors
    public ReviewSeller() {
    }

    public ReviewSeller(Long id, Long userId, Long sellerId, Integer rating, String comment, Date createdAt) {
        this.id = id;
        this.userId = userId;
        this.sellerId = sellerId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    // Getter & Setter for id

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    // Getter & Setter for userId
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Getter & Setter for sellerId
    public Long getSellerId() {
        return sellerId;
    }
    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    // Getter & Setter for rating
    public Integer getRating() {
        return rating;
    }
    public void setRating(Integer rating) {
        this.rating = rating;
    }

    // Getter & Setter for comment
    public String getComment() {
        return comment;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }

    // Getter & Setter for createdAt
    public Date getCreatedAt() {
        return createdAt;

    }    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    // Added toString method for better debugging
    @Override
    public String toString() {
        return "ReviewSeller{" +
                "id=" + id +
                ", userId=" + userId +
                ", sellerId=" + sellerId +
                ", rating=" + rating +
                ", comment='" + (comment != null ? comment.substring(0, Math.min(20, comment.length())) + "..." : "null") + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }

}
