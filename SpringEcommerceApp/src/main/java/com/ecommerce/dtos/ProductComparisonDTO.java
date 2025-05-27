package com.ecommerce.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductComparisonDTO {
    private Long productId;
    private String productName;
    private double price;
    private String description;
    private String imageUrl;
    private String storeName;
    private Long storeId;
    private int quantity;
    private Double averageRating;
    private int reviewCount;
    private String categoryName;
    private boolean inStock;
    private String storeAddress;
    private Double priceComparisonPercent; // Phần trăm cao/thấp hơn so với giá trung bình
    private boolean bestPrice; // Đánh dấu nếu đây là giá tốt nhất trong danh sách so sánh
    private boolean bestRated; // Đánh dấu nếu đây là sản phẩm được đánh giá cao nhất
}
