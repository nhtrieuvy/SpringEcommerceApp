package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.repositories.ReviewProductRepository;
import com.ecommerce.services.ReviewProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewProductServiceImpl implements ReviewProductService {

    @Autowired
    private ReviewProductRepository reviewRepo;

    @Override
    public void addReview(ReviewProduct review) {
        reviewRepo.addReview(review);
    }

    @Override
    public List<ReviewProduct> getReviewsByProductId(Long productId) {
        return reviewRepo.getReviewsByProductId(productId);
    }
}
