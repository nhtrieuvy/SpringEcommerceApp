package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.ReviewReply;
import com.ecommerce.repositories.ReviewReplyRepository;
import java.util.List;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReviewReplyRepositoryImpl implements ReviewReplyRepository {

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void addReply(ReviewReply reply) {
        this.sessionFactory.getCurrentSession().persist(reply);
    }

    @Override
    public List<ReviewReply> getRepliesByReviewId(Long reviewId) {
        return this.sessionFactory.getCurrentSession()
                .createQuery("FROM ReviewReply WHERE reviewId = :rid", ReviewReply.class)
                .setParameter("rid", reviewId)
                .getResultList();
    }
}
