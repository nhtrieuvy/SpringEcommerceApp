package com.ecommerce.services;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.dtos.OrderSummaryDTO;
import java.util.Date;
import java.util.List;
import java.util.Map;

public interface OrderService {    void save(Order order);
    void update(Order order);
    void update(Order order, Long userId);
    void delete(Long id);
    Order findById(Long id);
    List<Order> findAll();
    List<Order> findByUserId(Long userId);
    List<OrderSummaryDTO> findByUserIdAsDTO(Long userId);
    List<Order> findByStatusAndDateRange(String status, Date fromDate, Date toDate);
    Map<String, Long> getOrderCountByStatus();
    Map<String, Double> getRevenueByDateRange(String groupBy, Date fromDate, Date toDate);
    Map<String, Integer> getOrderCountByDateRange(String groupBy, Date fromDate, Date toDate);
    Map<String, Integer> getTopSellingProducts(int limit);
    Map<String, Double> getRevenueByCategoryDateRange(Date fromDate, Date toDate);
    byte[] generateOrderExcel(List<Order> orders);
    byte[] generateReportExcel(String reportType, Date fromDate, Date toDate);
    List<OrderStatusHistory> getOrderStatusHistory(Long orderId);
    
    void addOrderStatusHistory(Order order, String status, String note, Long userId);
    
    void updateWithoutHistory(Order order);
    
    List<Order> findOrdersByStoreId(Long storeId);
    List<Order> findOrdersByStoreIdAndStatus(Long storeId, String status);
    List<Order> findOrdersBySellerId(Long sellerId);
    List<Order> findOrdersBySellerIdAndStatus(Long sellerId, String status);
    List<OrderSummaryDTO> findOrdersByStoreIdAsDTO(Long storeId);
    List<OrderSummaryDTO> findOrdersBySellerIdAsDTO(Long sellerId);
}