package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewSeller;
import com.ecommerce.repositories.ReviewSellerRepository;
import com.ecommerce.services.ReviewSellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewSellerServiceImpl implements ReviewSellerService {

    @Autowired
    private ReviewSellerRepository reviewRepo;

    @Override
    public void addReview(ReviewSeller review) {
        reviewRepo.addReview(review);
    }

    @Override
    public List<ReviewSeller> getReviewsBySellerId(Long sellerId) {
        return reviewRepo.getReviewsBySellerId(sellerId);
    }
}
