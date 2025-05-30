package com.ecommerce.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderCreateDTO {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<OrderItemCreateDTO> items;
    
    @NotNull(message = "Payment method is required")
    @Size(min = 1, max = 50, message = "Payment method must be between 1 and 50 characters")
    private String paymentMethod;
      @DecimalMin(value = "0.0", inclusive = false, message = "Subtotal must be greater than 0")
    private Double subtotal;
    
    @DecimalMin(value = "0.0", message = "Shipping cost cannot be negative")
    private Double shipping;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Total must be greater than 0")
    private Double total;
    
    private Map<String, Object> shippingMethod;
    private Map<String, String> shippingInfo;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderItemCreateDTO {
        
        @NotNull(message = "Product ID is required")
        private Long productId;
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 1000, message = "Quantity cannot exceed 1000")
        private Integer quantity;
        
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        private Double price;
    }
}
