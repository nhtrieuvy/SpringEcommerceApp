package com.ecommerce.repositories;

import com.ecommerce.pojo.Review;
import java.util.List;

public interface ReviewRepository {
    void save(Review review);
    void update(Review review);
    void delete(Long id);
    Review findById(Long id);
    List<Review> findAll();
    List<Review> findByProductId(Long productId);
}