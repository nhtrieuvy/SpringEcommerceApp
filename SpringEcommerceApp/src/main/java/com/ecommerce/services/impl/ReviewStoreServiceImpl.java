package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewStore;
import com.ecommerce.repositories.ReviewStoreRepository;
import com.ecommerce.services.ReviewStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewStoreServiceImpl implements ReviewStoreService {

    @Autowired
    private ReviewStoreRepository reviewRepo;

    @Override
    public void addReview(ReviewStore review) {
        reviewRepo.addReview(review);
    }

    @Override
    public List<ReviewStore> getReviewsByStoreId(Long storeId) {
        return reviewRepo.getReviewsByStoreId(storeId);
    }
    
    @Override
    public double getAverageRatingForStore(Long storeId) {
        return reviewRepo.getAverageRatingForStore(storeId);
    }
}
