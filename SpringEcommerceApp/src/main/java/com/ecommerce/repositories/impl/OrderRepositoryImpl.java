package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.repositories.OrderRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.Date;
import java.util.List;

@Repository
public class OrderRepositoryImpl implements OrderRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Order order) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(order);
    }

    @Override
    public void update(Order order) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(order);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Order order = session.get(Order.class, id);
        if (order != null) session.remove(order);
    }    @Override
    public Order findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product WHERE o.id = :id";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("id", id);
        Order order = query.uniqueResult();
        
        // Initialize payment if exists
        if (order != null && order.getPayment() != null) {
            order.getPayment().getAmount(); // Force initialization
        }
        
        return order;
    }

    @Override
    public List<Order> findAll() {
        Session session = sessionFactory.getCurrentSession();
        // First fetch with order details
        String hql = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product";
        List<Order> orders = session.createQuery(hql, Order.class).list();
        
        // Initialize payments for each order to avoid LazyInitializationException
        for (Order order : orders) {
            if (order.getPayment() != null) {
                order.getPayment().getAmount(); // Force initialization
            }
        }
        
        return orders;
    }    @Override
    public List<Order> findByUserId(Long userId) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product WHERE o.user.id = :userId";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("userId", userId);
        List<Order> orders = query.list();
        
        // Initialize payments for each order to avoid LazyInitializationException
        for (Order order : orders) {
            if (order.getPayment() != null) {
                order.getPayment().getAmount(); // Force initialization
            }
        }
        
        return orders;
    }    @Override
    public List<Order> findByStatusAndDateRange(String status, Date fromDate, Date toDate) {
        Session session = sessionFactory.getCurrentSession();
        StringBuilder hql = new StringBuilder("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product WHERE 1=1");
        
        if (status != null && !status.isEmpty()) {
            hql.append(" AND o.status = :status");
        }
        
        if (fromDate != null) {
            hql.append(" AND o.orderDate >= :fromDate");
        }
        
        if (toDate != null) {
            hql.append(" AND o.orderDate <= :toDate");
        }
        
        Query<Order> query = session.createQuery(hql.toString(), Order.class);
        
        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }
        
        if (fromDate != null) {
            query.setParameter("fromDate", fromDate);
        }
        
        if (toDate != null) {
            query.setParameter("toDate", toDate);
        }
        
        List<Order> orders = query.list();
        
        // Initialize payments for each order to avoid LazyInitializationException
        for (Order order : orders) {
            if (order.getPayment() != null) {
                order.getPayment().getAmount(); // Force initialization
            }
        }
        
        return orders;
    }

    @Override
    public List<Object[]> findOrderCountByStatus() {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT status, COUNT(id) FROM Order GROUP BY status";
        return session.createQuery(hql, Object[].class).list();
    }

    @Override
    public List<Object[]> findRevenueByDateRange(String groupBy, Date fromDate, Date toDate) {
        Session session = sessionFactory.getCurrentSession();
        String dateFormat;
        
        // Format the date based on grouping parameter
        if ("daily".equals(groupBy)) {
            dateFormat = "DAY(orderDate), MONTH(orderDate), YEAR(orderDate)";
        } else if ("weekly".equals(groupBy)) {
            dateFormat = "WEEK(orderDate), YEAR(orderDate)";
        } else if ("monthly".equals(groupBy)) {
            dateFormat = "MONTH(orderDate), YEAR(orderDate)";
        } else {
            dateFormat = "YEAR(orderDate)";
        }
        
        String hql = "SELECT " + dateFormat + ", SUM(totalAmount) FROM Order " +
                     "WHERE orderDate BETWEEN :fromDate AND :toDate " +
                     "GROUP BY " + dateFormat + " ORDER BY " + dateFormat;
        
        Query<Object[]> query = session.createQuery(hql, Object[].class);
        query.setParameter("fromDate", fromDate);
        query.setParameter("toDate", toDate);
        
        return query.list();
    }

    @Override
    public List<Object[]> findTopSellingProducts(int limit) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT p.id, p.name, SUM(od.quantity) as totalSold " +
                     "FROM OrderDetail od JOIN od.product p " +
                     "GROUP BY p.id, p.name " +
                     "ORDER BY totalSold DESC";
        
        return session.createQuery(hql, Object[].class)
                .setMaxResults(limit)
                .list();
    }

    @Override
    public List<Object[]> findRevenueByCategoryDateRange(Date fromDate, Date toDate) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT c.name, SUM(od.quantity * od.price) as revenue " +
                     "FROM OrderDetail od " +
                     "JOIN od.product p " +
                     "JOIN p.category c " +
                     "JOIN od.order o " +
                     "WHERE o.orderDate BETWEEN :fromDate AND :toDate " +
                     "GROUP BY c.name " +
                     "ORDER BY revenue DESC";
        
        Query<Object[]> query = session.createQuery(hql, Object[].class);
        query.setParameter("fromDate", fromDate);
        query.setParameter("toDate", toDate);
        
        return query.list();
    }
}