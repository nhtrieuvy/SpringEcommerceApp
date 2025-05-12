package com.ecommerce.services;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderStatusHistory;
import java.util.Date;
import java.util.List;
import java.util.Map;

public interface OrderService {
    void save(Order order);
    void update(Order order);
    void delete(Long id);
    Order findById(Long id);
    List<Order> findAll();
    List<Order> findByUserId(Long userId);
    List<Order> findByStatusAndDateRange(String status, Date fromDate, Date toDate);
    Map<String, Long> getOrderCountByStatus();
    Map<String, Double> getRevenueByDateRange(String groupBy, Date fromDate, Date toDate);
    Map<String, Integer> getTopSellingProducts(int limit);
    Map<String, Double> getRevenueByCategoryDateRange(Date fromDate, Date toDate);
    byte[] generateOrderExcel(List<Order> orders);
    byte[] generateReportExcel(String reportType, Date fromDate, Date toDate);
    
    // Phương thức mới để lấy lịch sử trạng thái đơn hàng
    List<OrderStatusHistory> getOrderStatusHistory(Long orderId);
    
    // Phương thức thêm mới lịch sử trạng thái
    void addOrderStatusHistory(Order order, String status, String note, Long userId);
}