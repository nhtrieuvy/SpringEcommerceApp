package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.repositories.OrderStatusHistoryRepository;
import java.util.List;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class OrderStatusHistoryRepositoryImpl implements OrderStatusHistoryRepository {

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public List<OrderStatusHistory> findByOrderId(Long orderId) {
        Session session = sessionFactory.getCurrentSession();
        Query<OrderStatusHistory> query = session.createQuery(
                "SELECT new com.ecommerce.pojo.OrderStatusHistory(h.id, h.status, h.note, h.createdAt) " +
                        "FROM OrderStatusHistory h WHERE h.order.id = :orderId ORDER BY h.createdAt DESC",
                OrderStatusHistory.class);
        query.setParameter("orderId", orderId);
        return query.getResultList();
    }

    @Override
    public void save(OrderStatusHistory history) {
        Session session = sessionFactory.getCurrentSession();
        if (history.getId() == null) {
            session.persist(history);
        } else {
            session.merge(history);
        }
        session.flush();
    }
}
