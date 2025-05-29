package com.ecommerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ecommerce.pojo.Product;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * DTO with business logic for product display
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDisplayDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String formattedPrice;  // Business logic formatting
    private String stockStatus;    // Business logic calculation
    private String availability;   // Business logic
    private String imageUrl;
    private String storeName;
    private boolean isInStock;
    private boolean isOnSale;
    private BigDecimal discountPercent;
    
    // Business logic trong DTO
    public static ProductDisplayDTO fromEntity(Product product) {
        ProductDisplayDTO dto = new ProductDisplayDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        
        // Price formatting business logic
        BigDecimal price = BigDecimal.valueOf(product.getPrice());
        dto.setPrice(price);
        dto.setFormattedPrice(formatCurrency(price));
        
        // Stock status business logic
        dto.setInStock(product.getQuantity() > 0);
        dto.setStockStatus(calculateStockStatus(product.getQuantity()));
        dto.setAvailability(calculateAvailability(product));
        
        // Store information
        if (product.getStore() != null) {
            dto.setStoreName(product.getStore().getName());
        }
        
        return dto;
    }
    
    private static String formatCurrency(BigDecimal price) {
        return String.format("%,.0f VNĐ", price.setScale(0, RoundingMode.HALF_UP));
    }
    
    private static String calculateStockStatus(int quantity) {
        if (quantity == 0) return "Hết hàng";
        if (quantity < 10) return "Sắp hết hàng";
        return "Còn hàng";
    }
    
    private static String calculateAvailability(Product product) {
        if (!product.isActive()) return "Ngừng kinh doanh";
        if (product.getQuantity() == 0) return "Tạm hết hàng";
        return "Sẵn sàng giao hàng";
    }
}
