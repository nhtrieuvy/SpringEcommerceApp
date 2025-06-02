package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.repositories.ReviewProductRepository;
import java.util.List;


import org.hibernate.Session;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReviewProductRepositoryImpl implements ReviewProductRepository {
    
    @Autowired

    private SessionFactory sessionFactory;    @Override
    public void addReview(ReviewProduct review) {
        Session session = this.sessionFactory.getCurrentSession();
        if (review.getId() != null && review.getId() > 0) {
            session.merge(review);
        } else {
            session.persist(review);
        }
    }
    
    @Override
    public void updateReview(ReviewProduct review) {
        this.sessionFactory.getCurrentSession().merge(review);
    }
    
    @Override
    public void deleteReview(Long id) {
        Session session = this.sessionFactory.getCurrentSession();
        ReviewProduct review = session.get(ReviewProduct.class, id);
        if (review != null) {
            session.remove(review);
        }
    }
    
    @Override
    public ReviewProduct getReviewById(Long id) {

        return this.sessionFactory.getCurrentSession().get(ReviewProduct.class, id);

    }

    @Override
    public List<ReviewProduct> getReviewsByProductId(Long productId) {
        return this.sessionFactory.getCurrentSession()
                .createQuery("FROM ReviewProduct WHERE productId = :pid", ReviewProduct.class)
                .setParameter("pid", productId)
                .getResultList();
    }

    @Override
    public double getAverageRatingByProductId(Long productId) {
        Double result = this.sessionFactory.getCurrentSession()
                .createQuery("SELECT AVG(rating) FROM ReviewProduct WHERE productId = :pid", Double.class)
                .setParameter("pid", productId)
                .getSingleResult();
        
        if (result == null) {
            return 0.0;
        }
        
        return result.doubleValue();
    }

}
