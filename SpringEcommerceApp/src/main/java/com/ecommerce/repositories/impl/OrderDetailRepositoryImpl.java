package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.OrderDetail;
import com.ecommerce.repositories.OrderDetailRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

@Repository
public class OrderDetailRepositoryImpl implements OrderDetailRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(OrderDetail orderDetail) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(orderDetail);
    }

    @Override
    public void update(OrderDetail orderDetail) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(orderDetail);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        OrderDetail orderDetail = session.get(OrderDetail.class, id);
        if (orderDetail != null) session.remove(orderDetail);
    }    @Override
    public OrderDetail findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT od FROM OrderDetail od LEFT JOIN FETCH od.product WHERE od.id = :id";
        Query<OrderDetail> query = session.createQuery(hql, OrderDetail.class);
        query.setParameter("id", id);
        return query.uniqueResult();
    }

    @Override
    public List<OrderDetail> findAll() {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT od FROM OrderDetail od LEFT JOIN FETCH od.product";
        return session.createQuery(hql, OrderDetail.class).list();
    }    @Override
    public List<OrderDetail> findByOrderId(Long orderId) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT od FROM OrderDetail od LEFT JOIN FETCH od.product WHERE od.order.id = :orderId";
        Query<OrderDetail> query = session.createQuery(hql, OrderDetail.class);
        query.setParameter("orderId", orderId);
        return query.list();
    }
}