package com.ecommerce.repositories;

import com.ecommerce.pojo.ReviewStore;
import java.util.List;

public interface ReviewStoreRepository {
    void addReview(ReviewStore review);
    List<ReviewStore> getReviewsByStoreId(Long storeId);
    double getAverageRatingForStore(Long storeId);
}
