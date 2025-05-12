package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.repositories.ReviewProductRepository;
import java.util.List;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReviewProductRepositoryImpl implements ReviewProductRepository {
    
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void addReview(ReviewProduct review) {
        this.sessionFactory.getCurrentSession().persist(review);
    }

    @Override
    public List<ReviewProduct> getReviewsByProductId(Long productId) {
        return this.sessionFactory.getCurrentSession()
                .createQuery("FROM ReviewProduct WHERE productId = :pid", ReviewProduct.class)
                .setParameter("pid", productId)
                .getResultList();
    }
}
