package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.ReviewSeller;
import com.ecommerce.repositories.ReviewSellerRepository;
import java.util.List;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReviewSellerRepositoryImpl implements ReviewSellerRepository {
    
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void addReview(ReviewSeller review) {
        this.sessionFactory.getCurrentSession().persist(review);
    }

    @Override
    public List<ReviewSeller> getReviewsBySellerId(Long sellerId) {
        return this.sessionFactory.getCurrentSession()
                .createQuery("FROM ReviewSeller WHERE sellerId = :sid", ReviewSeller.class)
                .setParameter("sid", sellerId)
                .getResultList();
    }
}
