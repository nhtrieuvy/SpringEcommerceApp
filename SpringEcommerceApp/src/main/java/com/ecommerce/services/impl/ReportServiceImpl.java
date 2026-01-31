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

        List<Order> orders = orderService.findByStatusAndDateRange("COMPLETED", fromDate, toDate);

        double totalRevenue = orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        int totalOrders = orders.size();

        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        int totalProductsSold = orders.stream()
                .flatMap(order -> order.getOrderDetails().stream())
                .mapToInt(detail -> detail.getQuantity())
                .sum();

        reportData.put("totalRevenue", totalRevenue);
        reportData.put("totalOrders", totalOrders);
        reportData.put("totalProductsSold", totalProductsSold);
        reportData.put("avgOrderValue", avgOrderValue);

        Map<String, Double> revenueByPeriod = orderService.getRevenueByDateRange(periodType, fromDate, toDate);
        reportData.put("revenueByPeriod", convertToChartData(revenueByPeriod));

        Map<String, Integer> orderCountByPeriod = orderService.getOrderCountByDateRange(periodType, fromDate, toDate);
        reportData.put("orderCountByPeriod", convertToChartData(orderCountByPeriod));

        Map<String, Long> orderStatusCounts = orderService.getOrderCountByStatus();
        reportData.put("orderStatus", convertToChartData(orderStatusCounts));

        Map<String, Double> categoryRevenue = orderService.getRevenueByCategoryDateRange(fromDate, toDate);
        reportData.put("categoryRevenue", convertToChartData(categoryRevenue)); // Top sản phẩm bán chạy (cho biểu đồ)
        Map<String, Integer> topProductsChart = orderService.getTopSellingProducts(5);
        reportData.put("topProductsChart", convertToChartData(topProductsChart));
        List<Map<String, Object>> categoryStats = generateCategoryStats(orders, totalRevenue);
        reportData.put("categoryStats", categoryStats != null ? categoryStats : new ArrayList<>());

        List<Map<String, Object>> topProductsDetails = generateTopProductsDetails(orders, totalRevenue);
        reportData.put("topProducts", topProductsDetails != null ? topProductsDetails : new ArrayList<>());

        return reportData;
    }


    @Override
    public Map<String, Object> generateSellerReport(Date fromDate, Date toDate) {
        Map<String, Object> reportData = new HashMap<>();

        List<User> sellers = userService.findByRole("SELLER");

        System.out.println("DEBUG: Found " + sellers.size() + " sellers with SELLER role");

        if (sellers.isEmpty()) {
            List<User> allUsers = userService.findAll();
            System.out.println("DEBUG: No SELLER role users found, checking all " + allUsers.size() + " users");
            sellers = allUsers;
        }

        reportData.put("totalSellers", sellers.size());

        List<Map<String, Object>> sellerStatsList = new ArrayList<>();
        Map<String, Double> revenueMap = new HashMap<>();
        Map<String, Integer> ordersMap = new HashMap<>();
        double totalRevenue = 0;
        int totalOrders = 0;
        int totalProducts = 0;

        for (User seller : sellers) {
            List<Order> sellerOrders = orderService.findOrdersBySellerId(seller.getId());

            List<Order> filteredOrders = sellerOrders.stream()
                    .filter(order -> order.getOrderDate() != null &&
                            (order.getOrderDate().after(fromDate) || order.getOrderDate().equals(fromDate)) &&
                            (order.getOrderDate().before(toDate) || order.getOrderDate().equals(toDate)))
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

        for (Map<String, Object> sellerStats : sellerStatsList) {
            double revenue = (Double) sellerStats.get("revenue");
            double percentage = totalRevenue > 0 ? (revenue / totalRevenue) : 0;
            sellerStats.put("percentage", percentage);
        }

        sellerStatsList.sort((s1, s2) -> Double.compare((Double) s2.get("revenue"), (Double) s1.get("revenue")));

        List<Map<String, Object>> topSellers = sellerStatsList.stream()
                .limit(5)
                .collect(Collectors.toList());

        long activeSellers = sellerStatsList.size();

        reportData.put("activeSellers", activeSellers);
        reportData.put("totalSellerRevenue", totalRevenue);
        reportData.put("avgRevenuePerSeller", activeSellers > 0 ? totalRevenue / activeSellers : 0);
        reportData.put("totalOrders", totalOrders);
        reportData.put("totalProductsSold", totalProducts);

        reportData.put("revenueBySeller", sellerStatsList);
        reportData.put("topSellers", topSellers);

        reportData.put("ordersBySeller", sellerStatsList);

        return reportData;
    }

    @Override
    public Map<String, Object> generateInventoryReport() {
        Map<String, Object> reportData = new HashMap<>();

        List<Product> products = productService.findAll();

        double totalInventoryValue = products.stream()
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();

        reportData.put("totalInventoryValue", totalInventoryValue);

        Map<String, Double> inventoryByCategory = products.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getName(),
                        Collectors.summingDouble(p -> p.getPrice() * p.getQuantity())));

        reportData.put("inventoryByCategory", convertToChartData(inventoryByCategory));

        return reportData;
    }

    @Override
    public byte[] exportReportToExcel(String reportType, Date fromDate, Date toDate) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Báo cáo " + getReportTypeName(reportType));

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setFontHeightInPoints((short) 12);
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

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

            for (int i = 0; i < 10; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    private void createSalesReportSheet(XSSFSheet sheet, XSSFCellStyle headerStyle, Map<String, Object> data) {

        Row headerRow = sheet.createRow(0);
        String[] headers = { "Kỳ báo cáo", "Doanh thu (VNĐ)", "Số đơn hàng", "Giá trị trung bình" };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> revenueChartData = (Map<String, Object>) data.get("revenueByPeriod");
        @SuppressWarnings("unchecked")
        Map<String, Object> orderCountChartData = (Map<String, Object>) data.get("orderCountByPeriod");

        List<String> labels = null;
        List<Object> revenueValues = null;
        List<Object> orderCountValues = null;

        if (revenueChartData != null) {
            @SuppressWarnings("unchecked")
            List<String> tempLabels = (List<String>) revenueChartData.get("labels");
            @SuppressWarnings("unchecked")
            List<Object> tempValues = (List<Object>) revenueChartData.get("values");
            labels = tempLabels;
            revenueValues = tempValues;
        }

        if (orderCountChartData != null) {
            @SuppressWarnings("unchecked")
            List<Object> tempOrderCountValues = (List<Object>) orderCountChartData.get("values");
            orderCountValues = tempOrderCountValues;
        }

        double totalRevenue = data.get("totalRevenue") != null ? (Double) data.get("totalRevenue") : 0.0;
        int totalOrders = data.get("totalOrders") != null ? (Integer) data.get("totalOrders") : 0;
        double avgOrderValue = data.get("avgOrderValue") != null ? (Double) data.get("avgOrderValue") : 0.0;

        int rowNum = 1;

        if (labels != null && revenueValues != null && labels.size() == revenueValues.size()) {

            for (int i = 0; i < labels.size(); i++) {
                Row row = sheet.createRow(rowNum++);
                String period = labels.get(i);
                Double revenue = revenueValues.get(i) instanceof Number ? ((Number) revenueValues.get(i)).doubleValue()
                        : 0.0;

                Integer orderCount = 0;
                if (orderCountValues != null && i < orderCountValues.size()
                        && orderCountValues.get(i) instanceof Number) {
                    orderCount = ((Number) orderCountValues.get(i)).intValue();
                }

                double avgValue = orderCount > 0 ? revenue / orderCount : 0.0;

                row.createCell(0).setCellValue(period);
                row.createCell(1).setCellValue(revenue);
                row.createCell(2).setCellValue(orderCount);
                row.createCell(3).setCellValue(avgValue);
            }
        } else {

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Tổng kết");
            row.createCell(1).setCellValue(totalRevenue);
            row.createCell(2).setCellValue(totalOrders);
            row.createCell(3).setCellValue(avgOrderValue);
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

    private List<Map<String, Object>> generateCategoryStats(List<Order> orders, double totalRevenue) {
        Map<String, Integer> categoryOrderCount = new HashMap<>();
        Map<String, Integer> categoryProductCount = new HashMap<>();
        Map<String, Double> categoryRevenue = new HashMap<>();

        for (Order order : orders) {
            for (OrderDetail detail : order.getOrderDetails()) {
                String categoryName = detail.getProduct().getCategory() != null
                        ? detail.getProduct().getCategory().getName()
                        : "Không xác định";

                int orderCount = categoryOrderCount.getOrDefault(categoryName, 0) + 1;
                categoryOrderCount.put(categoryName, orderCount);

                int quantity = detail.getQuantity();
                int productCount = categoryProductCount.getOrDefault(categoryName, 0) + quantity;
                categoryProductCount.put(categoryName, productCount);

                double lineRevenue = detail.getPrice() * quantity;
                double revenue = categoryRevenue.getOrDefault(categoryName, 0.0) + lineRevenue;
                categoryRevenue.put(categoryName, revenue);
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

        categoryStats.sort((a, b) -> Double.compare((Double) b.get("revenue"), (Double) a.get("revenue")));

        return categoryStats;
    }

    private List<Map<String, Object>> generateTopProductsDetails(List<Order> orders, double totalRevenue) {
        Map<Long, Integer> productQuantities = new HashMap<>();
        Map<Long, Double> productRevenues = new HashMap<>();
        Map<Long, Product> productMap = new HashMap<>();

        for (Order order : orders) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Long productId = detail.getProduct().getId();
                int quantity = detail.getQuantity();
                int totalQuantity = productQuantities.getOrDefault(productId, 0) + quantity;
                productQuantities.put(productId, totalQuantity);

                double lineRevenue = detail.getPrice() * quantity;
                double totalProductRevenue = productRevenues.getOrDefault(productId, 0.0) + lineRevenue;
                productRevenues.put(productId, totalProductRevenue);
                productMap.put(productId, detail.getProduct());
            }
        }

        List<Map<String, Object>> topProducts = new ArrayList<>();

        productQuantities.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(10)
                .forEach(entry -> {
                    Long productId = entry.getKey();
                    Product product = productMap.get(productId);
                    double revenue = productRevenues.get(productId);

                    Map<String, Object> productData = new HashMap<>();
                    productData.put("name", product.getName());
                    productData.put("categoryName",
                            product.getCategory() != null ? product.getCategory().getName() : "Không xác định");
                    productData.put("quantitySold", entry.getValue());
                    productData.put("revenue", revenue);
                    productData.put("percentage", totalRevenue > 0 ? revenue / totalRevenue : 0.0);
                    productData.put("image", product.getImage());

                    topProducts.add(productData);
                });

        return topProducts;
    }
}
