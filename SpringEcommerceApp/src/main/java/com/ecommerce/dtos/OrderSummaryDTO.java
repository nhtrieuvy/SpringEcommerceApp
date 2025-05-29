package com.ecommerce.dtos;

import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for returning summarized order information without loading all associated entities.
 * This is used to minimize payload size and optimize API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDTO {
    private Long id;
    private Long userId;
    private String username;
    private Date orderDate;
    private String status;
    private Double totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private Integer itemCount;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Integer orderDetailsCount;
    private String firstProductName;
    private String storeName;
    private Long storeId;
    
    /**
     * DTO for order details with minimal information for listing views
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDetailSummaryDTO {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double price;
        private Double subtotal;
    }
}
