package com.ecommerce.services;

import com.ecommerce.pojo.ReviewProduct;
import java.util.List;

public interface ReviewProductService {
    void addReview(ReviewProduct review);
    List<ReviewProduct> getReviewsByProductId(Long productId);
}
