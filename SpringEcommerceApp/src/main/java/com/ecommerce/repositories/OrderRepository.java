package com.ecommerce.repositories;

import com.ecommerce.pojo.Order;
import java.util.Date;
import java.util.List;
import java.util.Map;

public interface OrderRepository {
    void save(Order order);
    void update(Order order);
    void delete(Long id);
    Order findById(Long id);
    List<Order> findAll();
    List<Order> findByUserId(Long userId);
    List<Order> findByStatusAndDateRange(String status, Date fromDate, Date toDate);
    List<Object[]> findOrderCountByStatus();
    List<Object[]> findRevenueByDateRange(String groupBy, Date fromDate, Date toDate);
    List<Object[]> findTopSellingProducts(int limit);
    List<Object[]> findRevenueByCategoryDateRange(Date fromDate, Date toDate);
}