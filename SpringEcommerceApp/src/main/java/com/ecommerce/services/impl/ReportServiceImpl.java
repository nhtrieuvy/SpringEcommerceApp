package com.ecommerce.services.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.services.OrderService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.ReportService;
import com.ecommerce.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Override
    public Map<String, Object> generateSalesReport(String periodType, Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy danh sách đơn hàng trong khoảng thời gian
        List<Order> orders = orderService.findByStatusAndDateRange("COMPLETED", fromDate, toDate);
        
        // Tính tổng doanh thu
        double totalRevenue = orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
        
        // Tính tổng số đơn hàng
        int totalOrders = orders.size();
        
        // Tính giá trị trung bình mỗi đơn hàng
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Tính tổng số sản phẩm bán ra
        int totalProductsSold = orders.stream()
                .flatMap(order -> order.getOrderDetails().stream())
                .mapToInt(detail -> detail.getQuantity())
                .sum();
        
        reportData.put("totalRevenue", totalRevenue);
        reportData.put("totalOrders", totalOrders);
        reportData.put("totalProductsSold", totalProductsSold);
        reportData.put("avgOrderValue", avgOrderValue);
        
        // Doanh thu theo thời gian
        Map<String, Double> revenueByPeriod = orderService.getRevenueByDateRange(periodType, fromDate, toDate);
        reportData.put("revenueByPeriod", convertToChartData(revenueByPeriod));
        
        // Trạng thái đơn hàng
        Map<String, Long> orderStatusCounts = orderService.getOrderCountByStatus();
        reportData.put("orderStatus", convertToChartData(orderStatusCounts));
        
        // Doanh thu theo danh mục
        Map<String, Double> categoryRevenue = orderService.getRevenueByCategoryDateRange(fromDate, toDate);
        reportData.put("categoryRevenue", convertToChartData(categoryRevenue));
        
        // Top sản phẩm bán chạy
        Map<String, Integer> topProducts = orderService.getTopSellingProducts(5);
        reportData.put("topProducts", convertToChartData(topProducts));
        
        return reportData;
    }

    @Override
    public Map<String, Object> generateProductReport(Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy tất cả sản phẩm
        List<Product> products = productService.findAll();
        
        // Tính số lượng sản phẩm theo trạng thái
        long activeProducts = products.stream().filter(Product::isActive).count();
        long inactiveProducts = products.size() - activeProducts;
        
        Map<String, Long> productStatus = new HashMap<>();
        productStatus.put("Đang bán", activeProducts);
        productStatus.put("Ngừng bán", inactiveProducts);
        
        reportData.put("totalProducts", products.size());
        reportData.put("activeProducts", activeProducts);
        reportData.put("inactiveProducts", inactiveProducts);
        reportData.put("productStatus", convertToChartData(productStatus));
        
        // Thông tin chi tiết sản phẩm tồn kho thấp
        List<Map<String, Object>> lowStockProducts = products.stream()
                .filter(p -> p.getQuantity() < 5 && p.isActive())
                .map(p -> {
                    Map<String, Object> productMap = new HashMap<>();
                    productMap.put("id", p.getId());
                    productMap.put("name", p.getName());
                    productMap.put("category", p.getCategory() != null ? p.getCategory().getName() : "Không có danh mục");
                    productMap.put("price", p.getPrice());
                    productMap.put("quantity", p.getQuantity());
                    return productMap;
                })
                .collect(Collectors.toList());
        
        reportData.put("lowStockProducts", lowStockProducts);
        
        return reportData;
    }

    @Override
    public Map<String, Object> generateCustomerReport(Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy tất cả người dùng
        List<User> users = userService.findAll();
        
        // Số lượng người dùng
        reportData.put("totalUsers", users.size());
        
        // Số lượng người dùng mới trong khoảng thời gian
        long newUsers = users.stream()
                .filter(u -> u.getCreatedDate() != null && 
                           u.getCreatedDate().after(fromDate) && 
                           u.getCreatedDate().before(toDate))
                .count();
        
        reportData.put("newUsers", newUsers);
        
        // Tìm top khách hàng có đơn hàng nhiều nhất
        Map<Long, Long> userOrderCounts = orderService.findAll().stream()
                .filter(o -> o.getUser() != null)
                .collect(Collectors.groupingBy(o -> o.getUser().getId(), Collectors.counting()));
        
        List<Map<String, Object>> topCustomers = userOrderCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    User user = userService.findById(entry.getKey());
                    Map<String, Object> customerMap = new HashMap<>();
                    customerMap.put("id", user.getId());
                    customerMap.put("name", user.getFullname() != null ? user.getFullname() : user.getUsername());
                    customerMap.put("orderCount", entry.getValue());
                    
                    // Tính tổng chi tiêu
                    double totalSpent = orderService.findByUserId(user.getId()).stream()
                            .mapToDouble(Order::getTotalAmount)
                            .sum();
                    
                    customerMap.put("totalSpent", totalSpent);
                    return customerMap;
                })
                .collect(Collectors.toList());
        
        reportData.put("topCustomers", topCustomers);
        
        return reportData;
    }

    @Override
    public Map<String, Object> generateInventoryReport() {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy tất cả sản phẩm
        List<Product> products = productService.findAll();
        
        // Tổng giá trị hàng tồn kho
        double totalInventoryValue = products.stream()
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();
        
        reportData.put("totalInventoryValue", totalInventoryValue);
        
        // Phân tích tồn kho theo danh mục
        Map<String, Double> inventoryByCategory = products.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getName(),
                        Collectors.summingDouble(p -> p.getPrice() * p.getQuantity())
                ));
        
        reportData.put("inventoryByCategory", convertToChartData(inventoryByCategory));
        
        return reportData;
    }

    @Override
    public byte[] exportReportToExcel(String reportType, Date fromDate, Date toDate) {
        // Implementation should use Apache POI to create Excel report
        // For now, return empty byte array
        return new byte[0];
    }
    
    /**
     * Convert map data to format suitable for charts
     * @param data Map containing data
     * @return Map with labels and values arrays
     */
    private Map<String, Object> convertToChartData(Map<?, ?> data) {
        Map<String, Object> chartData = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        
        for (Map.Entry<?, ?> entry : data.entrySet()) {
            labels.add(entry.getKey().toString());
            values.add(entry.getValue());
        }
        
        chartData.put("labels", labels);
        chartData.put("values", values);
        
        return chartData;
    }
}
