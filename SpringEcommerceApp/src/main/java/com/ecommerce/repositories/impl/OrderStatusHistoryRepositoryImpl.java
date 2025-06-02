package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.repositories.OrderStatusHistoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class OrderStatusHistoryRepositoryImpl implements OrderStatusHistoryRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<OrderStatusHistory> findByOrderId(Long orderId) {

        Query query = entityManager.createQuery(
                "SELECT new com.ecommerce.pojo.OrderStatusHistory(h.id, h.status, h.note, h.createdAt) " +
                        "FROM OrderStatusHistory h WHERE h.order.id = :orderId ORDER BY h.createdAt DESC");
        query.setParameter("orderId", orderId);
        return query.getResultList();
    }

    @Override
    public void save(OrderStatusHistory history) {
        if (history.getId() == null) {
            entityManager.persist(history);
        } else {
            entityManager.merge(history);
        }
        entityManager.flush();
    }
}
