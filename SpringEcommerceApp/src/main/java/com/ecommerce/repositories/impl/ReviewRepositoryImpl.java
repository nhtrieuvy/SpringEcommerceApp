package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Review;
import com.ecommerce.repositories.ReviewRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

@Repository
public class ReviewRepositoryImpl implements ReviewRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Review review) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(review);
    }

    @Override
    public void update(Review review) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(review);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Review review = session.get(Review.class, id);
        if (review != null) session.remove(review);
    }

    @Override
    public Review findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Review.class, id);
    }

    @Override
    public List<Review> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Review", Review.class).list();
    }

    @Override
    public List<Review> findByProductId(Long productId) {
        Session session = sessionFactory.getCurrentSession();
        Query<Review> query = session.createQuery("FROM Review WHERE product.id = :productId", Review.class);
        query.setParameter("productId", productId);
        return query.list();
    }
}