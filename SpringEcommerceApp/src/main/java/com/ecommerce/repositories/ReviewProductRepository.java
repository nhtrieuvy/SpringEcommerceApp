package com.ecommerce.repositories;

import com.ecommerce.pojo.ReviewProduct;
import java.util.List;

public interface ReviewProductRepository {
    void addReview(ReviewProduct review);
    List<ReviewProduct> getReviewsByProductId(Long productId);
}
