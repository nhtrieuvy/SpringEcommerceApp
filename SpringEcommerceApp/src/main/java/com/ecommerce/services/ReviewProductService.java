package com.ecommerce.services;

import com.ecommerce.pojo.ReviewProduct;
import java.util.List;

public interface ReviewProductService {

   
    ReviewProduct addReview(ReviewProduct review);
    
   
    ReviewProduct updateReview(ReviewProduct review);
    
 
    boolean deleteReview(Long reviewId);

    ReviewProduct getReviewById(Long reviewId);

    List<ReviewProduct> getReviewsByProductId(Long productId);
    

    double getAverageRatingByProductId(Long productId);

}
