package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.repositories.ReviewProductRepository;
import com.ecommerce.services.ReviewProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Transactional

public class ReviewProductServiceImpl implements ReviewProductService {

    @Autowired
    private ReviewProductRepository reviewRepo;

    private final Map<Long, ReviewProduct> reviews = new ConcurrentHashMap<>();
    private final Map<Long, List<ReviewProduct>> reviewsByProductId = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    @Override
    public ReviewProduct addReview(ReviewProduct review) {
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(new Date());
        }

        try {
            System.out.println("Attempting to save review to database: " + review);
            reviewRepo.addReview(review);
            System.out.println("Review successfully saved to database with ID: " + review.getId());

            reviews.put(review.getId(), review);

            reviewsByProductId.computeIfAbsent(review.getProductId(), k -> new ArrayList<>())
                    .add(review);
        } catch (Exception e) {
            System.err.println("ERROR saving review to database: " + e.getMessage());
            e.printStackTrace();

            if (review.getId() == null) {
                review.setId(idCounter.getAndIncrement());

                reviews.put(review.getId(), review);

                reviewsByProductId.computeIfAbsent(review.getProductId(), k -> new ArrayList<>())
                        .add(review);
            }
        }

        return review;
    }

    @Override
    public ReviewProduct updateReview(ReviewProduct review) {
        try {
            ReviewProduct existingReview = reviewRepo.getReviewById(review.getId());
            if (existingReview != null) {
                existingReview.setRating(review.getRating());
                existingReview.setComment(review.getComment());

                reviewRepo.updateReview(existingReview);

                reviews.put(existingReview.getId(), existingReview);
                return existingReview;
            }
        } catch (Exception e) {
            System.err.println("ERROR updating review in database: " + e.getMessage());
            e.printStackTrace();
        }

        if (!reviews.containsKey(review.getId())) {
            return null;
        }

        ReviewProduct existingReview = reviews.get(review.getId());

        existingReview.setRating(review.getRating());
        existingReview.setComment(review.getComment());

        return existingReview;
    }

    @Override
    public boolean deleteReview(Long reviewId) {
        try {
            reviewRepo.deleteReview(reviewId);

            ReviewProduct review = reviews.remove(reviewId);
            if (review != null && reviewsByProductId.containsKey(review.getProductId())) {
                reviewsByProductId.get(review.getProductId()).removeIf(r -> r.getId().equals(reviewId));
            }

            return true;
        } catch (Exception e) {
            System.err.println("ERROR deleting review from database: " + e.getMessage());
            e.printStackTrace();

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
            ReviewProduct dbReview = reviewRepo.getReviewById(reviewId);
            if (dbReview != null) {
                reviews.put(dbReview.getId(), dbReview);
                return dbReview;
            }
        } catch (Exception e) {
            System.err.println("ERROR getting review from database: " + e.getMessage());
            e.printStackTrace();
        }

        return reviews.get(reviewId);
    }

    @Override
    public List<ReviewProduct> getReviewsByProductId(Long productId) {
        try {
            List<ReviewProduct> dbReviews = reviewRepo.getReviewsByProductId(productId);
            if (dbReviews != null && !dbReviews.isEmpty()) {
                return dbReviews;
            }
        } catch (Exception e) {
            System.err.println("Error getting reviews from repository: " + e.getMessage());
        }

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
