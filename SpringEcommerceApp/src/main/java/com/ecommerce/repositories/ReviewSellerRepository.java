package com.ecommerce.repositories;

import com.ecommerce.pojo.ReviewSeller;
import java.util.List;

public interface ReviewSellerRepository {
    void addReview(ReviewSeller review);
    List<ReviewSeller> getReviewsBySellerId(Long sellerId);
}
