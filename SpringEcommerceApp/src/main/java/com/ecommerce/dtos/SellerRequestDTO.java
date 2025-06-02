package com.ecommerce.dtos;

import com.ecommerce.pojo.SellerRequest;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.Date;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class SellerRequestDTO {
    private Long id;
    private String shopName;
    private String description;
    private String address;
    private String taxNumber;
    private String bankAccount;
    private String bankName;
    private String sellerType;
    private String status;
    private String statusNotes;
    private String reviewedBy;
    private Date reviewedDate;
    private Date createdDate;
    
    private Long userId;
    private String username;
    private String fullname;
    private String email;
    
    private String displayStatus;
    private String formattedCreatedDate;
    private long daysSinceCreated;
    private boolean isPending;
    private boolean isApproved;
    private boolean isRejected;
    
    public static SellerRequestDTO fromEntity(SellerRequest request) {
        if (request == null) {
            return null;
        }
        
        SellerRequestDTO dto = SellerRequestDTO.builder()
            .id(request.getId())
            .shopName(request.getShopName())
            .description(request.getDescription())
            .address(request.getAddress())
            .taxNumber(request.getTaxNumber())
            .bankAccount(request.getBankAccount())
            .bankName(request.getBankName())
            .sellerType(request.getSellerType())
            .status(request.getStatus())
            .statusNotes(request.getStatusNotes())
            .reviewedBy(request.getReviewedBy())
            .reviewedDate(request.getReviewedDate())
            .createdDate(request.getCreatedDate())
            .build();
        
        if (request.getUser() != null) {
            dto.setUserId(request.getUser().getId());
            dto.setUsername(request.getUser().getUsername());
            dto.setFullname(request.getUser().getFullname());
            dto.setEmail(request.getUser().getEmail());
        }
        
        dto.applyBusinessLogic();
        
        return dto;
    }
    
    
    private void applyBusinessLogic() {
        
        this.isPending = "PENDING".equals(this.status);
        this.isApproved = "APPROVED".equals(this.status);
        this.isRejected = "REJECTED".equals(this.status);
        
        switch (this.status != null ? this.status : "UNKNOWN") {
            case "PENDING":
                this.displayStatus = "Đang chờ xử lý";
                break;
            case "APPROVED":
                this.displayStatus = "Đã phê duyệt";
                break;
            case "REJECTED":
                this.displayStatus = "Đã từ chối";
                break;
            default:
                this.displayStatus = "Không xác định";
        }
        
        if (this.createdDate != null) {
            long diffInMs = System.currentTimeMillis() - this.createdDate.getTime();
            this.daysSinceCreated = diffInMs / (24 * 60 * 60 * 1000);
            
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm");
            this.formattedCreatedDate = sdf.format(this.createdDate);
        }
    }
    
    
    public int getPriorityLevel() {
        if (isPending) return 1; 
        if (isApproved) return 2;
        if (isRejected) return 3;
        return 4;
    }
    
   
    public boolean isOverdue() {
        return isPending && daysSinceCreated > 7;
    }
    
   
    public String getStatusBadgeClass() {
        switch (this.status != null ? this.status : "UNKNOWN") {
            case "PENDING":
                return "badge-warning";
            case "APPROVED":
                return "badge-success";
            case "REJECTED":
                return "badge-danger";
            default:
                return "badge-secondary";
        }
    }
}
