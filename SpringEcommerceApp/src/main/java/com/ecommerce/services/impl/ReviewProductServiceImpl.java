package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.repositories.ReviewProductRepository;
import com.ecommerce.services.ReviewProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Transactional

public class ReviewProductServiceImpl implements ReviewProductService {

    @Autowired
    private ReviewProductRepository reviewRepo;

    
    // Temporary storage for reviews until full database implementation
    private final Map<Long, ReviewProduct> reviews = new ConcurrentHashMap<>();
    private final Map<Long, List<ReviewProduct>> reviewsByProductId = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);    @Override
    public ReviewProduct addReview(ReviewProduct review) {
        // Set timestamp
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(new Date());
        }
        
        // Try to save to database with better error handling
        try {
            System.out.println("Attempting to save review to database: " + review);
            reviewRepo.addReview(review);
            System.out.println("Review successfully saved to database with ID: " + review.getId());
            
            // Save to memory as backup after successful database save
            reviews.put(review.getId(), review);
            
            // Update index by productId in memory
            reviewsByProductId.computeIfAbsent(review.getProductId(), k -> new ArrayList<>())
                            .add(review);
        } catch (Exception e) {
            // Log detailed error for better debugging
            System.err.println("ERROR saving review to database: " + e.getMessage());
            e.printStackTrace();
            
            // Use in-memory storage as fallback if database fails
            if (review.getId() == null) {
                review.setId(idCounter.getAndIncrement());
                
                // Save to memory as backup
                reviews.put(review.getId(), review);
                
                // Update index by productId in memory
                reviewsByProductId.computeIfAbsent(review.getProductId(), k -> new ArrayList<>())
                                .add(review);
            }
        }
        
        return review;
    }
      @Override
    public ReviewProduct updateReview(ReviewProduct review) {
        try {
            // Check if review exists in the database
            ReviewProduct existingReview = reviewRepo.getReviewById(review.getId());
            if (existingReview != null) {
                // Only update rating and comment, keep other fields unchanged
                existingReview.setRating(review.getRating());
                existingReview.setComment(review.getComment());
                
                // Update in database
                reviewRepo.updateReview(existingReview);
                
                // Update in memory as well
                reviews.put(existingReview.getId(), existingReview);
                return existingReview;
            }
        } catch (Exception e) {
            System.err.println("ERROR updating review in database: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Fallback to in-memory
        if (!reviews.containsKey(review.getId())) {
            return null;
        }
        
        ReviewProduct existingReview = reviews.get(review.getId());
        
        // Only update rating and comment, keep other fields unchanged
        existingReview.setRating(review.getRating());
        existingReview.setComment(review.getComment());
        
        return existingReview;
    }
      @Override
    public boolean deleteReview(Long reviewId) {
        try {
            // Try to delete from database first
            reviewRepo.deleteReview(reviewId);
            
            // Remove from in-memory storage as well
            ReviewProduct review = reviews.remove(reviewId);
            if (review != null && reviewsByProductId.containsKey(review.getProductId())) {
                reviewsByProductId.get(review.getProductId()).removeIf(r -> r.getId().equals(reviewId));
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("ERROR deleting review from database: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback to in-memory if database fails
            ReviewProduct review = reviews.remove(reviewId);
            if (review != null && reviewsByProductId.containsKey(review.getProductId())) {
                reviewsByProductId.get(review.getProductId()).removeIf(r -> r.getId().equals(reviewId));
                return true;
            }
            return false;
        }
    }
      @Override
    public ReviewProduct getReviewById(Long reviewId) {
        try {
            // Try to get from database first
            ReviewProduct dbReview = reviewRepo.getReviewById(reviewId);
            if (dbReview != null) {
                // Update in-memory copy for consistency
                reviews.put(dbReview.getId(), dbReview);
                return dbReview;
            }
        } catch (Exception e) {
            System.err.println("ERROR getting review from database: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Fall back to in-memory storage
        return reviews.get(reviewId);
    }
    
    @Override
    public List<ReviewProduct> getReviewsByProductId(Long productId) {
        // Try to get from repository first
        try {
            List<ReviewProduct> dbReviews = reviewRepo.getReviewsByProductId(productId);
            if (dbReviews != null && !dbReviews.isEmpty()) {
                return dbReviews;
            }
        } catch (Exception e) {
            // Log error but continue with in-memory storage
            System.err.println("Error getting reviews from repository: " + e.getMessage());
        }
        
        // Fall back to in-memory storage
        return reviewsByProductId.getOrDefault(productId, new ArrayList<>());
    }
    
    @Override
    public double getAverageRatingByProductId(Long productId) {
        List<ReviewProduct> productReviews = getReviewsByProductId(productId);
        if (productReviews.isEmpty()) {
            return 0.0;
        }
        
        double sum = productReviews.stream()
                .mapToInt(ReviewProduct::getRating)
                .sum();
        
        return sum / productReviews.size();

    }
}
