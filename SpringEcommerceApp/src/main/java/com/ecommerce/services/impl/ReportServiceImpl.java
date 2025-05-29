package com.ecommerce.services.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderDetail;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.services.OrderService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.ReportService;
import com.ecommerce.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

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
        reportData.put("categoryRevenue", convertToChartData(categoryRevenue));        // Top sản phẩm bán chạy (cho biểu đồ)
        Map<String, Integer> topProductsChart = orderService.getTopSellingProducts(5);
        reportData.put("topProductsChart", convertToChartData(topProductsChart));
          // Chi tiết thống kê theo danh mục
        List<Map<String, Object>> categoryStats = generateCategoryStats(orders, totalRevenue);
        reportData.put("categoryStats", categoryStats != null ? categoryStats : new ArrayList<>());
        
        // Chi tiết top sản phẩm bán chạy 
        List<Map<String, Object>> topProductsDetails = generateTopProductsDetails(orders, totalRevenue);
        reportData.put("topProducts", topProductsDetails != null ? topProductsDetails : new ArrayList<>());
        
        return reportData;
    }

    @Override
    public Map<String, Object> generateProductReport(Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy tất cả sản phẩm
        List<Product> products = productService.findAll();
        
        // Tổng số sản phẩm
        int totalProducts = products.size();
        reportData.put("totalProducts", totalProducts);
        
        // Sản phẩm hết hàng
        long outOfStockProducts = products.stream()
                .filter(p -> p.getQuantity() <= 0)
                .count();
        reportData.put("outOfStockProducts", outOfStockProducts);
        
        // Sản phẩm sắp hết hàng (< 10)
        long lowStockProducts = products.stream()
                .filter(p -> p.getQuantity() > 0 && p.getQuantity() < 10)
                .count();
        reportData.put("lowStockProducts", lowStockProducts);
        
        // Giá trị tồn kho
        double totalInventoryValue = products.stream()
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();
        reportData.put("totalInventoryValue", totalInventoryValue);
        
        // Lấy đơn hàng trong khoảng thời gian để tính sản phẩm bán chạy
        List<Order> orders = orderService.findByStatusAndDateRange("COMPLETED", fromDate, toDate);
        
        // Thống kê sản phẩm bán chạy
        Map<Long, Integer> productSales = new HashMap<>();
        Map<Long, Double> productRevenue = new HashMap<>();
        
        for (Order order : orders) {
            order.getOrderDetails().forEach(detail -> {
                Long productId = detail.getProduct().getId();
                int quantity = detail.getQuantity();
                double revenue = detail.getPrice() * quantity;
                
                productSales.merge(productId, quantity, Integer::sum);
                productRevenue.merge(productId, revenue, Double::sum);
            });
        }
        
        // Top 10 sản phẩm bán chạy
        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Product product = productService.findById(entry.getKey());
                    Map<String, Object> productData = new HashMap<>();
                    productData.put("id", product.getId());
                    productData.put("name", product.getName());
                    productData.put("quantitySold", entry.getValue());
                    productData.put("revenue", productRevenue.get(entry.getKey()));
                    productData.put("image", product.getImage());
                    productData.put("categoryName", product.getCategory() != null ? product.getCategory().getName() : "Không xác định");
                    return productData;
                })
                .collect(Collectors.toList());
        
        reportData.put("topProducts", topProducts);
        
        // Thống kê theo danh mục
        Map<String, Integer> categoryStats = products.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getName(),
                        Collectors.summingInt(p -> 1)
                ));
        
        reportData.put("categoryStats", convertToChartData(categoryStats));
        
        return reportData;
    }

    @Override
    public Map<String, Object> generateCustomerReport(Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy tất cả khách hàng (users với role CUSTOMER)
        List<User> customers = userService.findByRole("CUSTOMER");
        
        // Nếu không có CUSTOMER role, lấy tất cả users trừ ADMIN
        if (customers.isEmpty()) {
            customers = userService.findAll().stream()
                    .filter(user -> !user.getRoles().stream()
                            .anyMatch(role -> "ADMIN".equals(role.getName())))
                    .collect(Collectors.toList());
        }
        
        // Tổng số khách hàng
        int totalCustomers = customers.size();
        reportData.put("totalCustomers", totalCustomers);
          // Lấy tất cả đơn hàng và lọc theo ngày
        List<Order> allOrders = orderService.findAll();
        List<Order> orders = allOrders.stream()
                .filter(order -> 
                    order.getOrderDate() != null &&
                    (order.getOrderDate().after(fromDate) || order.getOrderDate().equals(fromDate)) && 
                    (order.getOrderDate().before(toDate) || order.getOrderDate().equals(toDate))
                )
                .collect(Collectors.toList());
        
        // Khách hàng có đơn hàng trong kỳ
        Set<Long> activeCustomerIds = orders.stream()
                .map(order -> order.getUser().getId())
                .collect(Collectors.toSet());
        
        int activeCustomers = activeCustomerIds.size();
        reportData.put("activeCustomers", activeCustomers);
        
        // Khách hàng mới (đăng ký trong kỳ)
        long newCustomers = customers.stream()
                .filter(customer -> customer.getCreatedDate() != null)
                .filter(customer -> 
                    (customer.getCreatedDate().after(fromDate) || customer.getCreatedDate().equals(fromDate)) && 
                    (customer.getCreatedDate().before(toDate) || customer.getCreatedDate().equals(toDate))
                )
                .count();
        reportData.put("newCustomers", newCustomers);
        
        // Tổng doanh thu từ khách hàng
        double totalRevenue = orders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        reportData.put("totalRevenue", totalRevenue);
        
        // Doanh thu trung bình per khách hàng
        double avgRevenuePerCustomer = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;
        reportData.put("avgRevenuePerCustomer", avgRevenuePerCustomer);
        
        // Top 10 khách hàng VIP
        Map<Long, Double> customerRevenue = new HashMap<>();
        Map<Long, Integer> customerOrders = new HashMap<>();
        
        for (Order order : orders) {
            if ("COMPLETED".equals(order.getStatus())) {
                Long customerId = order.getUser().getId();
                customerRevenue.merge(customerId, order.getTotalAmount(), Double::sum);
                customerOrders.merge(customerId, 1, Integer::sum);
            }
        }
        
        List<Map<String, Object>> topCustomers = customerRevenue.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    User customer = userService.findById(entry.getKey());
                    Map<String, Object> customerData = new HashMap<>();
                    customerData.put("id", customer.getId());
                    customerData.put("name", customer.getFullname() != null ? customer.getFullname() : customer.getUsername());
                    customerData.put("email", customer.getEmail());
                    customerData.put("revenue", entry.getValue());
                    customerData.put("orderCount", customerOrders.get(entry.getKey()));
                    return customerData;
                })
                .collect(Collectors.toList());
        
        reportData.put("topCustomers", topCustomers);
        
        return reportData;
    }    @Override
    public Map<String, Object> generateSellerReport(Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();
        
        // Lấy tất cả người bán (users với role SELLER)
        List<User> sellers = userService.findByRole("SELLER");
        
        System.out.println("DEBUG: Found " + sellers.size() + " sellers with SELLER role");
        
        // Nếu không có SELLER, thử lấy tất cả users
        if (sellers.isEmpty()) {
            List<User> allUsers = userService.findAll();
            System.out.println("DEBUG: No SELLER role users found, checking all " + allUsers.size() + " users");
            sellers = allUsers;
        }
        
        // Tổng số người bán
        reportData.put("totalSellers", sellers.size());
        
        // Tính doanh thu theo từng người bán
        List<Map<String, Object>> sellerStatsList = new ArrayList<>();
        Map<String, Double> revenueMap = new HashMap<>();
        Map<String, Integer> ordersMap = new HashMap<>();
        double totalRevenue = 0;
        int totalOrders = 0;
        int totalProducts = 0;
        
        for (User seller : sellers) {
            List<Order> sellerOrders = orderService.findOrdersBySellerId(seller.getId());
            
            // Lọc đơn hàng trong khoảng thời gian
            List<Order> filteredOrders = sellerOrders.stream()
                    .filter(order -> 
                        order.getOrderDate() != null &&
                        (order.getOrderDate().after(fromDate) || order.getOrderDate().equals(fromDate)) && 
                        (order.getOrderDate().before(toDate) || order.getOrderDate().equals(toDate))
                    )
                    .collect(Collectors.toList());
            
            if (!filteredOrders.isEmpty()) {
                String sellerName = seller.getFullname() != null ? seller.getFullname() : seller.getUsername();
                double sellerRevenue = filteredOrders.stream()
                        .mapToDouble(Order::getTotalAmount)
                        .sum();
                
                int orderCount = filteredOrders.size();
                int productCount = filteredOrders.stream()
                        .mapToInt(order -> order.getOrderDetails().size())
                        .sum();
                  Map<String, Object> sellerStats = new HashMap<>();
                sellerStats.put("name", sellerName);
                sellerStats.put("email", seller.getEmail() != null ? seller.getEmail() : "N/A");
                sellerStats.put("orderCount", orderCount);
                sellerStats.put("productCount", productCount);
                sellerStats.put("revenue", sellerRevenue);
                sellerStats.put("avgRevenue", orderCount > 0 ? sellerRevenue / orderCount : 0);
                
                sellerStatsList.add(sellerStats);
                revenueMap.put(sellerName, sellerRevenue);
                ordersMap.put(sellerName, orderCount);
                
                totalRevenue += sellerRevenue;
                totalOrders += orderCount;
                totalProducts += productCount;
            }
        }
        
        // Tính phần trăm cho mỗi người bán
        for (Map<String, Object> sellerStats : sellerStatsList) {
            double revenue = (Double) sellerStats.get("revenue");
            double percentage = totalRevenue > 0 ? (revenue / totalRevenue) : 0;
            sellerStats.put("percentage", percentage);
        }
        
        // Sắp xếp theo doanh thu giảm dần
        sellerStatsList.sort((s1, s2) -> Double.compare((Double) s2.get("revenue"), (Double) s1.get("revenue")));
        
        // Top 5 người bán
        List<Map<String, Object>> topSellers = sellerStatsList.stream()
                .limit(5)
                .collect(Collectors.toList());
        
        // Số người bán hoạt động
        long activeSellers = sellerStatsList.size();
        
        reportData.put("activeSellers", activeSellers);
        reportData.put("totalSellerRevenue", totalRevenue);
        reportData.put("avgRevenuePerSeller", activeSellers > 0 ? totalRevenue / activeSellers : 0);
        reportData.put("totalOrders", totalOrders);
        reportData.put("totalProductsSold", totalProducts);
        
        // Dữ liệu cho template
        reportData.put("revenueBySeller", sellerStatsList);
        reportData.put("topSellers", topSellers);
        
        // Dữ liệu cho biểu đồ
        reportData.put("ordersBySeller", sellerStatsList);
        
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
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Báo cáo " + getReportTypeName(reportType));
            
            // Create header style
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setFontHeightInPoints((short) 12);
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            // Create data based on report type
            Map<String, Object> reportData = null;
            
            switch (reportType) {
                case "sales":
                    reportData = generateSalesReport("monthly", fromDate, toDate);
                    createSalesReportSheet(sheet, headerStyle, reportData);
                    break;
                
                default:
                    reportData = generateSalesReport("monthly", fromDate, toDate);
                    createSalesReportSheet(sheet, headerStyle, reportData);
                    break;
            }
            
            // Auto-size all columns
            for (int i = 0; i < 10; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Write to output stream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
    
    private void createSalesReportSheet(XSSFSheet sheet, XSSFCellStyle headerStyle, Map<String, Object> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Kỳ báo cáo", "Doanh thu (VNĐ)", "Số đơn hàng", "Giá trị trung bình"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Add data rows
        Map<String, Double> revenue = (Map<String, Double>) data.get("revenueByPeriod");
        Map<String, Integer> orderCounts = (Map<String, Integer>) data.get("orderCountByPeriod");
        
        int rowNum = 1;
        for (Map.Entry<String, Double> entry : revenue.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            String period = entry.getKey();
            Double value = entry.getValue();
            Integer orderCount = orderCounts.getOrDefault(period, 0);
            
            row.createCell(0).setCellValue(period);
            row.createCell(1).setCellValue(value);
            row.createCell(2).setCellValue(orderCount);
            
            if (orderCount > 0) {
                row.createCell(3).setCellValue(value / orderCount);
            } else {
                row.createCell(3).setCellValue(0);
            }
        }
    }
    
    private void createProductReportSheet(XSSFSheet sheet, XSSFCellStyle headerStyle, Map<String, Object> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Sản phẩm", "Số lượng đã bán", "Doanh thu (VNĐ)"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Add data rows
        Map<String, Integer> topProducts = (Map<String, Integer>) data.get("topProducts");
        Map<String, Double> productRevenue = (Map<String, Double>) data.get("productRevenue");
        
        int rowNum = 1;
        for (Map.Entry<String, Integer> entry : topProducts.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            String productName = entry.getKey();
            Integer quantity = entry.getValue();
            Double revenue = productRevenue.getOrDefault(productName, 0.0);
            
            row.createCell(0).setCellValue(productName);
            row.createCell(1).setCellValue(quantity);
            row.createCell(2).setCellValue(revenue);
        }
    }
    
    private void createCategoryReportSheet(XSSFSheet sheet, XSSFCellStyle headerStyle, Map<String, Object> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Danh mục", "Doanh thu (VNĐ)", "Phần trăm"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Add data rows
        Map<String, Double> categoryRevenue = (Map<String, Double>) data.get("categoryRevenue");
        
        // Calculate total for percentage
        double total = categoryRevenue.values().stream().mapToDouble(Double::doubleValue).sum();
        
        int rowNum = 1;
        for (Map.Entry<String, Double> entry : categoryRevenue.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            String category = entry.getKey();
            Double revenue = entry.getValue();
            double percentage = (total > 0) ? (revenue / total) * 100 : 0;
            
            row.createCell(0).setCellValue(category);
            row.createCell(1).setCellValue(revenue);
            row.createCell(2).setCellValue(String.format("%.2f%%", percentage));
        }
    }
    
    private void createUserReportSheet(XSSFSheet sheet, XSSFCellStyle headerStyle, Map<String, Object> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Loại người dùng", "Số lượng", "Phần trăm"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Add data rows
        Map<String, Integer> userCounts = (Map<String, Integer>) data.get("userCountsByRole");
        
        // Calculate total for percentage
        int total = userCounts.values().stream().mapToInt(Integer::intValue).sum();
        
        int rowNum = 1;
        for (Map.Entry<String, Integer> entry : userCounts.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            String role = entry.getKey();
            Integer count = entry.getValue();
            double percentage = (total > 0) ? ((double)count / total) * 100 : 0;
            
            row.createCell(0).setCellValue(role);
            row.createCell(1).setCellValue(count);
            row.createCell(2).setCellValue(String.format("%.2f%%", percentage));
        }
    }
    
    private String getReportTypeName(String reportType) {
        switch (reportType) {
            case "sales":
                return "Doanh thu";
            case "products":
                return "Sản phẩm";
            case "categories":
                return "Danh mục";
            case "users":
                return "Người dùng";
            default:
                return "Doanh thu";
        }
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
    
    /**
     * Generate detailed category statistics for sales reports
     */
    private List<Map<String, Object>> generateCategoryStats(List<Order> orders, double totalRevenue) {
        Map<String, Integer> categoryOrderCount = new HashMap<>();
        Map<String, Integer> categoryProductCount = new HashMap<>();
        Map<String, Double> categoryRevenue = new HashMap<>();
        
        for (Order order : orders) {
            for (OrderDetail detail : order.getOrderDetails()) {
                String categoryName = detail.getProduct().getCategory() != null 
                    ? detail.getProduct().getCategory().getName() 
                    : "Không xác định";
                
                categoryOrderCount.merge(categoryName, 1, Integer::sum);
                categoryProductCount.merge(categoryName, detail.getQuantity(), Integer::sum);
                categoryRevenue.merge(categoryName, detail.getPrice() * detail.getQuantity(), Double::sum);
            }
        }
        
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        for (String categoryName : categoryRevenue.keySet()) {
            Map<String, Object> categoryData = new HashMap<>();
            double revenue = categoryRevenue.get(categoryName);
            
            categoryData.put("name", categoryName);
            categoryData.put("orderCount", categoryOrderCount.get(categoryName));
            categoryData.put("productCount", categoryProductCount.get(categoryName));
            categoryData.put("revenue", revenue);
            categoryData.put("percentage", totalRevenue > 0 ? revenue / totalRevenue : 0.0);
            
            categoryStats.add(categoryData);
        }
        
        // Sort by revenue descending
        categoryStats.sort((a, b) -> Double.compare((Double) b.get("revenue"), (Double) a.get("revenue")));
        
        return categoryStats;
    }
    
    /**
     * Generate detailed top products statistics for sales reports
     */
    private List<Map<String, Object>> generateTopProductsDetails(List<Order> orders, double totalRevenue) {
        Map<Long, Integer> productQuantities = new HashMap<>();
        Map<Long, Double> productRevenues = new HashMap<>();
        Map<Long, Product> productMap = new HashMap<>();
        
        for (Order order : orders) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Long productId = detail.getProduct().getId();
                productQuantities.merge(productId, detail.getQuantity(), Integer::sum);
                productRevenues.merge(productId, detail.getPrice() * detail.getQuantity(), Double::sum);
                productMap.put(productId, detail.getProduct());
            }
        }
        
        List<Map<String, Object>> topProducts = new ArrayList<>();
        
        // Sort products by quantity sold and take top 10
        productQuantities.entrySet().stream()
            .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
            .limit(10)
            .forEach(entry -> {
                Long productId = entry.getKey();
                Product product = productMap.get(productId);
                double revenue = productRevenues.get(productId);
                
                Map<String, Object> productData = new HashMap<>();
                productData.put("name", product.getName());
                productData.put("categoryName", product.getCategory() != null ? product.getCategory().getName() : "Không xác định");
                productData.put("quantitySold", entry.getValue());
                productData.put("revenue", revenue);
                productData.put("percentage", totalRevenue > 0 ? revenue / totalRevenue : 0.0);
                productData.put("image", product.getImage());
                
                topProducts.add(productData);
            });
        
        return topProducts;
    }
}
