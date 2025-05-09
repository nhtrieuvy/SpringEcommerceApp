package com.ecommerce.pojo;

import jakarta.persistence.*;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seller_requests")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SellerRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "shop_name", nullable = false)
    private String shopName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address")
    private String address;

    @Column(name = "tax_number")
    private String taxNumber;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "seller_type", nullable = false)
    private String sellerType; // individual/business

    @Column(name = "id_card_front", columnDefinition = "TEXT")
    private String idCardFront; // URL to Cloudinary image

    @Column(name = "id_card_back", columnDefinition = "TEXT")
    private String idCardBack; // URL to Cloudinary image

    @Column(name = "business_license", columnDefinition = "TEXT")
    private String businessLicense; // URL to Cloudinary image

    @Column(name = "status", nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "status_notes")
    private String statusNotes; // For rejection reason or approval notes

    @Column(name = "reviewed_by")
    private String reviewedBy; // Username of the admin/staff who reviewed

    @Column(name = "reviewed_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date reviewedDate;

    @Column(name = "created_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = new Date();
        }
        if (status == null) {
            status = "PENDING";
        }
    }
}
