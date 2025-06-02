package com.ecommerce.repositories;

import com.ecommerce.pojo.Order;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
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
    List<Object[]> findOrderCountByDateRange(String groupBy, Date fromDate, Date toDate);
    List<Object[]> findTopSellingProducts(int limit);
    List<Object[]> findRevenueByCategoryDateRange(Date fromDate, Date toDate);
   
    List<Order> findOrdersByStoreId(Long storeId);
    List<Order> findOrdersByStoreIdAndStatus(Long storeId, String status);
    List<Order> findOrdersBySellerId(Long sellerId);
    List<Order> findOrdersBySellerIdAndStatus(Long sellerId, String status);
}