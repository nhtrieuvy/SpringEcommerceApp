package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Payment;
import com.ecommerce.repositories.PaymentRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

@Repository
public class PaymentRepositoryImpl implements PaymentRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Payment payment) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(payment);
    }

    @Override
    public void update(Payment payment) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(payment);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Payment payment = session.get(Payment.class, id);
        if (payment != null) {
            session.remove(payment);
        }
    }

    @Override
    public Payment findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Payment.class, id);
    }

    @Override
    public List<Payment> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Payment", Payment.class).list();
    }

    @Override
    public Payment findByOrderId(Long orderId) {
        Session session = sessionFactory.getCurrentSession();
        Query<Payment> query = session.createQuery("FROM Payment WHERE order.id = :orderId", Payment.class);
        query.setParameter("orderId", orderId);
        return query.uniqueResult();
    }

    @Override
    public Payment findByTransactionId(String transactionId) {
        Session session = sessionFactory.getCurrentSession();
        Query<Payment> query = session.createQuery("FROM Payment p WHERE p.transactionId = :transactionId", Payment.class);
        query.setParameter("transactionId", transactionId);
        return query.uniqueResultOptional().orElse(null);
    }
}