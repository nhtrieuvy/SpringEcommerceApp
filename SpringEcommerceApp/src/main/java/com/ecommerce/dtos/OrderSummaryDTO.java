package com.ecommerce.dtos;

import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


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
