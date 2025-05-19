package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.ReviewStore;
import com.ecommerce.repositories.ReviewStoreRepository;
import java.util.List;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReviewStoreRepositoryImpl implements ReviewStoreRepository {
    
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void addReview(ReviewStore review) {
        this.sessionFactory.getCurrentSession().persist(review);
    }

    @Override
    public List<ReviewStore> getReviewsByStoreId(Long storeId) {
        return this.sessionFactory.getCurrentSession()
                .createQuery("FROM ReviewStore WHERE storeId = :sid", ReviewStore.class)
                .setParameter("sid", storeId)
                .getResultList();
    }
    
    @Override
    public double getAverageRatingForStore(Long storeId) {
        Object result = this.sessionFactory.getCurrentSession()
                .createQuery("SELECT AVG(rating) FROM ReviewStore WHERE storeId = :sid")
                .setParameter("sid", storeId)
                .getSingleResult();
        
        if (result == null) {
            return 0.0;
        }
        
        return ((Double) result).doubleValue();
    }
}
