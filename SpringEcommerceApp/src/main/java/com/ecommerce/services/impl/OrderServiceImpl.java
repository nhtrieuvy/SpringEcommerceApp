package com.ecommerce.services.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.repositories.OrderStatusHistoryRepository;
import com.ecommerce.repositories.UserRepository;
import com.ecommerce.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public void save(Order order) {
        orderRepository.save(order);
        // Thêm lịch sử trạng thái ban đầu
        addOrderStatusHistory(order, order.getStatus(), "Đơn hàng mới được tạo", order.getUser().getId());
    }

    @Override
    public void update(Order order) {
        Order oldOrder = orderRepository.findById(order.getId());
        // Nếu trạng thái thay đổi, thêm vào lịch sử
        if (!oldOrder.getStatus().equals(order.getStatus())) {
            addOrderStatusHistory(order, order.getStatus(), "Trạng thái đơn hàng đã được cập nhật", null);
        }
        orderRepository.update(order);
    }

    @Override
    public void delete(Long id) {
        orderRepository.delete(id);
    }

    @Override
    public Order findById(Long id) {
        return orderRepository.findById(id);
    }

    @Override
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> findByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> findByStatusAndDateRange(String status, Date fromDate, Date toDate) {
        return orderRepository.findByStatusAndDateRange(status, fromDate, toDate);
    }

    @Override
    public Map<String, Long> getOrderCountByStatus() {
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        List<Object[]> results = orderRepository.findOrderCountByStatus();
        
        for (Object[] result : results) {
            String status = (String) result[0];
            Long count = (Long) result[1];
            
            // Convert status to display name
            String displayName = getStatusDisplayName(status);
            statusCounts.put(displayName, count);
        }
        
        return statusCounts;
    }

    @Override
    public Map<String, Double> getRevenueByDateRange(String groupBy, Date fromDate, Date toDate) {
        Map<String, Double> revenueByPeriod = new LinkedHashMap<>();
        List<Object[]> results = orderRepository.findRevenueByDateRange(groupBy, fromDate, toDate);
        
        SimpleDateFormat dateFormat;
        if ("daily".equals(groupBy)) {
            dateFormat = new SimpleDateFormat("dd/MM");
        } else if ("weekly".equals(groupBy)) {
            dateFormat = new SimpleDateFormat("'Week 'w, yyyy");
        } else if ("monthly".equals(groupBy)) {
            dateFormat = new SimpleDateFormat("MM/yyyy");
        } else {
            dateFormat = new SimpleDateFormat("yyyy");
        }
        
        for (Object[] result : results) {
            // Format the date period label
            String periodLabel;
            if (result[0] instanceof Integer && result[1] instanceof Integer) {
                // For monthly grouping (month, year)
                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.MONTH, (Integer) result[0] - 1); // Month is 0-based in Calendar
                cal.set(Calendar.YEAR, (Integer) result[1]);
                periodLabel = dateFormat.format(cal.getTime());
            } else if (result[0] instanceof Integer && result[1] instanceof Integer && result[2] instanceof Integer) {
                // For daily grouping (day, month, year)
                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.DAY_OF_MONTH, (Integer) result[0]);
                cal.set(Calendar.MONTH, (Integer) result[1] - 1); // Month is 0-based in Calendar
                cal.set(Calendar.YEAR, (Integer) result[2]);
                periodLabel = dateFormat.format(cal.getTime());
            } else if (result[0] instanceof Integer) {
                // For yearly grouping (year)
                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.YEAR, (Integer) result[0]);
                periodLabel = dateFormat.format(cal.getTime());
            } else {
                // Fallback
                periodLabel = result[0].toString();
            }
            
            Double revenue = (Double) result[result.length - 1];
            revenueByPeriod.put(periodLabel, revenue);
        }
        
        return revenueByPeriod;
    }

    @Override
    public Map<String, Integer> getTopSellingProducts(int limit) {
        Map<String, Integer> topProducts = new LinkedHashMap<>();
        List<Object[]> results = orderRepository.findTopSellingProducts(limit);
        
        for (Object[] result : results) {
            String productName = (String) result[1];
            Integer quantity = ((Number) result[2]).intValue();
            topProducts.put(productName, quantity);
        }
        
        return topProducts;
    }

    @Override
    public Map<String, Double> getRevenueByCategoryDateRange(Date fromDate, Date toDate) {
        Map<String, Double> categoryRevenue = new LinkedHashMap<>();
        List<Object[]> results = orderRepository.findRevenueByCategoryDateRange(fromDate, toDate);
        
        for (Object[] result : results) {
            String categoryName = (String) result[0];
            Double revenue = (Double) result[1];
            categoryRevenue.put(categoryName, revenue);
        }
        
        return categoryRevenue;
    }

    @Override
    public byte[] generateOrderExcel(List<Order> orders) {
        // Implementation using Apache POI to create Excel file
        try {
            // This would be replaced with actual Apache POI code to generate Excel
            // For now, we'll return a placeholder
            return new byte[0];
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    @Override
    public byte[] generateReportExcel(String reportType, Date fromDate, Date toDate) {
        // Implementation using Apache POI to create Excel file
        try {
            // This would be replaced with actual Apache POI code to generate Excel
            // based on the report type and date range
            return new byte[0];
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
      // Helper method to get friendly status display name
    private String getStatusDisplayName(String statusCode) {
        switch (statusCode) {
            case "PENDING": return "Chờ xác nhận";
            case "PROCESSING": return "Đang xử lý";
            case "SHIPPING": return "Đang giao hàng";
            case "COMPLETED": return "Đã hoàn thành";
            case "CANCELLED": return "Đã hủy";
            default: return statusCode;
        }
    }
    
    @Override
    public List<OrderStatusHistory> getOrderStatusHistory(Long orderId) {
        return orderStatusHistoryRepository.findByOrderId(orderId);
    }
    
    @Override
    public void addOrderStatusHistory(Order order, String status, String note, Long userId) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setNote(note);
        history.setCreatedAt(new Date());
        
        if (userId != null) {
            User user = userRepository.findById(userId);
            history.setCreatedBy(user);
        }
        
        orderStatusHistoryRepository.save(history);
    }
}