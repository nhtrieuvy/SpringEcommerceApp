package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Comment;
import com.ecommerce.repositories.CommentRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

@Repository
public class CommentRepositoryImpl implements CommentRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Comment comment) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(comment);
    }

    @Override
    public void update(Comment comment) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(comment);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Comment comment = session.get(Comment.class, id);
        if (comment != null) session.remove(comment);
    }

    @Override
    public Comment findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Comment.class, id);
    }

    @Override
    public List<Comment> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Comment", Comment.class).list();
    }

    @Override
    public List<Comment> findByProductId(Long productId) {
        Session session = sessionFactory.getCurrentSession();
        Query<Comment> query = session.createQuery("FROM Comment WHERE product.id = :productId", Comment.class);
        query.setParameter("productId", productId);
        return query.list();
    }
}