package com.ecommerce.services;

import com.ecommerce.pojo.ReviewSeller;
import java.util.List;

public interface ReviewSellerService {
    void addReview(ReviewSeller review);
    List<ReviewSeller> getReviewsBySellerId(Long sellerId);
}
