package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.ReviewReply;
import com.ecommerce.repositories.ReviewReplyRepository;
import java.util.List;

import org.hibernate.Session;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReviewReplyRepositoryImpl implements ReviewReplyRepository {

    @Autowired

    private SessionFactory sessionFactory;

    @Override
    public void addReply(ReviewReply reply) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            session.persist(reply);
            session.flush(); // Ensure the entity is persisted immediately
            System.out.println("Reply persisted successfully with ID: " + reply.getId());
        } catch (Exception e) {
            System.err.println("Error persisting reply: " + e.getMessage());
            throw e; // Re-throw to handle at service level
        }
    }

    @Override
    public void deleteReply(Long id) {
        Session session = this.sessionFactory.getCurrentSession();
        ReviewReply reply = session.get(ReviewReply.class, id);
        if (reply != null) {
            session.remove(reply);
        }
    }

    @Override
    public ReviewReply getReplyById(Long id) {
        return this.sessionFactory.getCurrentSession().get(ReviewReply.class, id);

    }

    @Override
    public List<ReviewReply> getRepliesByReviewId(Long reviewId) {
        return this.sessionFactory.getCurrentSession()
                .createQuery("FROM ReviewReply WHERE reviewId = :rid", ReviewReply.class)
                .setParameter("rid", reviewId)
                .getResultList();
    }
}
