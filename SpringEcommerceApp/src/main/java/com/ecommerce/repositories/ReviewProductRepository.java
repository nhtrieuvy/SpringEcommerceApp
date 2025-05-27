package com.ecommerce.repositories;

import com.ecommerce.pojo.ReviewProduct;
import java.util.List;

public interface ReviewProductRepository {
    void addReview(ReviewProduct review);

    void updateReview(ReviewProduct review);
    void deleteReview(Long id);
    ReviewProduct getReviewById(Long id);
    List<ReviewProduct> getReviewsByProductId(Long productId);
    double getAverageRatingByProductId(Long productId);

}
