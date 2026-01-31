package com.ecommerce.services.impl;

import com.ecommerce.dtos.ProductComparisonDTO;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.repositories.ProductRepository;
import com.ecommerce.repositories.OrderDetailRepository;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.ReviewProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;
    
    @Autowired
    private Cloudinary cloudinary;
    
    @Autowired
    private ReviewProductService reviewProductService;

    


    @Override
    public Product save(Product product) {
        productRepository.save(product);
        return product;
    }

    @Override
    public Product update(Product product) {
        productRepository.update(product);
        return product;
    }

    @Override
    public void delete(Long id) {
        long usedInOrders = orderDetailRepository.countByProductId(id);
        if (usedInOrders > 0) {
            throw new IllegalStateException("Sản phẩm đã phát sinh đơn hàng, không thể xóa. Vui lòng ngừng bán.");
        }
        productRepository.delete(id);
    }

    @Override
    public Product findById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> findByName(String name) {
        return productRepository.findByName(name);
    }

    @Override
    public List<Product> findByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Product> findByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }

    @Override
    public List<Product> search(String keyword) {
        return productRepository.search(keyword);
    }

    @Override
    public List<Product> searchAdvanced(String name, Long storeId, Double minPrice, Double maxPrice,
                                        String sortBy, String sortDir, int page, int size) {
        return productRepository.searchAdvanced(name, storeId, minPrice, maxPrice, sortBy, sortDir, page, size);
    }    @Override
    public List<Product> findByStoreId(Long storeId) {
        return productRepository.findByStoreId(storeId);
    }    @Override
    public String uploadProductImage(MultipartFile imageFile) throws Exception {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", "ecommerce/products",
                "resource_type", "auto"
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(imageFile.getBytes(), params);
            
            // Get the secure URL from the upload result
            String imageUrl = (String) uploadResult.get("secure_url");
            
            return imageUrl;
        } catch (IOException e) {
            throw new Exception("Không thể tải lên hình ảnh: " + e.getMessage());
        }
    }    @Override
    public List<ProductComparisonDTO> compareProductsByCategory(Long categoryId) {
        List<Product> products = this.productRepository.findByCategoryId(categoryId);
        
        // Nếu không có sản phẩm, trả về danh sách rỗng
        if (products.isEmpty()) {
            return List.of();
        }
        
        // Tính giá trung bình của sản phẩm trong danh mục
        double averagePrice = products.stream()
                .mapToDouble(Product::getPrice)
                .average()
                .orElse(0.0);
        
        // Tìm giá thấp nhất
        double lowestPrice = products.stream()
                .mapToDouble(Product::getPrice)
                .min()
                .orElse(0.0);
        
        // Chuyển đổi danh sách sản phẩm thành danh sách DTO
        List<ProductComparisonDTO> result = products.stream()
                .map(product -> {
                    // Lấy thông tin đánh giá từ ReviewProductService
                    double avgRating = reviewProductService.getAverageRatingByProductId(product.getId());
                    List<ReviewProduct> reviews = reviewProductService.getReviewsByProductId(product.getId());
                    int reviewCount = reviews.size();
                    
                    // Tính phần trăm so với giá trung bình
                    double priceComparisonPercent = 0.0;
                    if (averagePrice > 0) {
                        priceComparisonPercent = ((product.getPrice() - averagePrice) / averagePrice) * 100;
                    }
                    
                    return ProductComparisonDTO.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .price(product.getPrice())
                            .description(product.getDescription())
                            .imageUrl(product.getImage())
                            .storeName(product.getStore().getName())
                            .storeId(product.getStore().getId())
                            .quantity(product.getQuantity())
                            .averageRating(avgRating)
                            .reviewCount(reviewCount)
                            .categoryName(product.getCategory().getName())
                            .inStock(product.getQuantity() > 0)
                            .storeAddress(product.getStore().getAddress())
                            .priceComparisonPercent(priceComparisonPercent)
                            .bestPrice(Math.abs(product.getPrice() - lowestPrice) < 0.01) // Đánh dấu nếu là giá tốt nhất
                            .bestRated(false) // Sẽ được cập nhật sau
                            .build();
                })
                .collect(Collectors.toList());
        
        // Tìm sản phẩm có rating cao nhất và đánh dấu
        double finalHighestRating = result.stream()
                .mapToDouble(ProductComparisonDTO::getAverageRating)
                .max()
                .orElse(0.0);
                
        if (finalHighestRating > 0) {
            result.forEach(dto -> {
                if (Math.abs(dto.getAverageRating() - finalHighestRating) < 0.01) {
                    dto.setBestRated(true);
                }
            });
        }
        
        return result;
    }
}
