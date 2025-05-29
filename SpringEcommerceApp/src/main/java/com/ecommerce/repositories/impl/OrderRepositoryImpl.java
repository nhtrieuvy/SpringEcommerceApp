package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderDetail;
import com.ecommerce.repositories.OrderRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Hibernate;
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
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Order order = session.get(Order.class, id);
        if (order != null)
            session.remove(order);
    }

    @Override
    public Order findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product WHERE o.id = :id";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("id", id);
        Order order = query.uniqueResult();

        // Initialize payment if exists
        if (order != null && order.getPayment() != null) {
            try {
                // Safely initialize payment by just accessing it
                order.getPayment();
            } catch (Exception e) {
                System.err.println("Error initializing payment for order ID " + order.getId() + ": " + e.getMessage());
                order.setPayment(null);
            }
        }

        return order;
    }

    @Override
    public void update(Order order) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(order);
    }

    @Override
    public List<Order> findAll() {
        Session session = sessionFactory.getCurrentSession();
        // Fetch orders with eager loading of order details, products, and payments
        String hql = "SELECT DISTINCT o FROM Order o " +
                "LEFT JOIN FETCH o.orderDetails od " +
                "LEFT JOIN FETCH od.product " +
                "LEFT JOIN FETCH o.payment";
        List<Order> orders = session.createQuery(hql, Order.class).list();

        return orders;
    }

    @Override
    public List<Order> findByUserId(Long userId) {
        Session session = sessionFactory.getCurrentSession();

        // Debug: Check how many orders exist for this user
        String countHql = "SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId";
        Query<Long> countQuery = session.createQuery(countHql, Long.class);
        countQuery.setParameter("userId", userId);
        Long orderCount = countQuery.uniqueResult();
        System.out.println("Total orders for user " + userId + ": " + orderCount);

        // Fetch orders WITHOUT JOIN FETCH to avoid duplication issues
        String orderHql = "SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.orderDate DESC";
        Query<Order> orderQuery = session.createQuery(orderHql, Order.class);
        orderQuery.setParameter("userId", userId);

        List<Order> orders = orderQuery.list();
        System.out.println("Orders returned from simple query: " + orders.size());

        // If no orders found, return empty list
        if (orders.isEmpty()) {
            return orders;
        }

        // Initialize relationships manually for each order
        for (Order order : orders) {
            System.out.println("Processing order ID: " + order.getId());
            try {
                // Initialize orderDetails collection
                if (order.getOrderDetails() != null) {
                    Hibernate.initialize(order.getOrderDetails());
                    System.out.println("  Order details count: " + order.getOrderDetails().size());

                    // Initialize products in order details
                    for (OrderDetail detail : order.getOrderDetails()) {
                        if (detail.getProduct() != null) {
                            Hibernate.initialize(detail.getProduct());
                        }
                    }
                }

                // Initialize payment if exists
                if (order.getPayment() != null) {
                    order.getPayment().getId(); // Access a property to initialize
                }

                // Initialize orderDetails collection if not already done
                if (order.getOrderDetails() != null) {
                    order.getOrderDetails().size(); // This forces initialization
                }

                // Initialize statusHistory - do it separately to avoid conflicts
                try {
                    if (order.getStatusHistory() != null) {
                        order.getStatusHistory().size(); // This forces initialization
                    }
                } catch (Exception e) {
                    // If statusHistory fails to load, set it to empty set
                    System.err.println(
                            "Warning: Could not load statusHistory for order " + order.getId() + ": " + e.getMessage());
                }

            } catch (Exception e) {
                System.err.println(
                        "Error initializing collections for order ID " + order.getId() + ": " + e.getMessage());
                // Don't set payment to null, just log the error
            }
        }

        System.out.println("Final orders returned: " + orders.size());
        return orders;
    }

    @Override
    public List<Order> findByStatusAndDateRange(String status, Date fromDate, Date toDate) {
        Session session = sessionFactory.getCurrentSession();
        StringBuilder hql = new StringBuilder(
                "SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product WHERE 1=1");

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
            try {
                if (order.getPayment() != null) {
                    // Safely initialize payment by just accessing it
                    order.getPayment();
                }
            } catch (Exception e) {
                System.err.println("Error initializing payment for order ID " + order.getId() + ": " + e.getMessage());
                order.setPayment(null);
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
    public List<Object[]> findOrderCountByDateRange(String groupBy, Date fromDate, Date toDate) {
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

        String hql = "SELECT " + dateFormat + ", COUNT(id) FROM Order " +
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
        query.setParameter("toDate", toDate);        return query.list();
    }

    @Override
    public List<Order> findOrdersByStoreId(Long storeId) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o " +
                    "LEFT JOIN FETCH o.orderDetails od " +
                    "LEFT JOIN FETCH od.product p " +
                    "LEFT JOIN FETCH p.store s " +
                    "WHERE s.id = :storeId " +
                    "ORDER BY o.orderDate DESC";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("storeId", storeId);
        return query.list();
    }

    @Override
    public List<Order> findOrdersByStoreIdAndStatus(Long storeId, String status) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o " +
                    "LEFT JOIN FETCH o.orderDetails od " +
                    "LEFT JOIN FETCH od.product p " +
                    "LEFT JOIN FETCH p.store s " +
                    "WHERE s.id = :storeId AND o.status = :status " +
                    "ORDER BY o.orderDate DESC";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("storeId", storeId);
        query.setParameter("status", status);
        return query.list();
    }    @Override
    public List<Order> findOrdersBySellerId(Long sellerId) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o " +
                    "LEFT JOIN FETCH o.orderDetails od " +
                    "LEFT JOIN FETCH od.product p " +
                    "LEFT JOIN FETCH p.store s " +
                    "WHERE s.seller.id = :sellerId " +
                    "ORDER BY o.orderDate DESC";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("sellerId", sellerId);
        return query.list();
    }    @Override
    public List<Order> findOrdersBySellerIdAndStatus(Long sellerId, String status) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT o FROM Order o " +
                    "LEFT JOIN FETCH o.orderDetails od " +
                    "LEFT JOIN FETCH od.product p " +
                    "LEFT JOIN FETCH p.store s " +
                    "WHERE s.seller.id = :sellerId AND o.status = :status " +
                    "ORDER BY o.orderDate DESC";
        Query<Order> query = session.createQuery(hql, Order.class);
        query.setParameter("sellerId", sellerId);
        query.setParameter("status", status);
        return query.list();
    }
}