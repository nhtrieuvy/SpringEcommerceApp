package com.ecommerce.services.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderDetail;
import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.pojo.User;
import com.ecommerce.dtos.OrderSummaryDTO;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.repositories.OrderStatusHistoryRepository;
import com.ecommerce.repositories.UserRepository;
import com.ecommerce.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.NoSuchElementException;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private UserRepository userRepository;    @Override
    public void save(Order order) {
        // Check if the order has any status history entries already
        if ((order.getStatusHistory() == null || order.getStatusHistory().isEmpty()) && 
            order.getUser() != null && order.getStatus() != null) {
            // Add initial status history if none exists
            addOrderStatusHistory(order, order.getStatus(), "Đơn hàng mới được tạo", 
                order.getUser().getId());
        }
        // Save the order with all its relationships (with proper cascade settings)
        orderRepository.save(order);
    }    @Override
    public void update(Order order) {
        // Call the overloaded method with null userId for backward compatibility
        update(order, null);
    }
    
    @Override
    public void update(Order order, Long userId) {
        // Fetch the current state of the order from the database
        Order existingOrder = orderRepository.findById(order.getId());
        if (existingOrder == null) {
            throw new NoSuchElementException("Order not found with id: " + order.getId());
        }

        // Check if the status has changed by comparing with the new status in the
        // 'order' object
        if (!existingOrder.getStatus().equals(order.getStatus())) {
            // Pass the 'order' object (which has the new status) to addOrderStatusHistory
            // Now we use the userId parameter that was passed to this method
            addOrderStatusHistory(order, order.getStatus(), "Trạng thái đơn hàng đã được cập nhật", userId);
        }

        // Use the update method in our repository
        orderRepository.update(order);
    }@Override
    public void updateWithoutHistory(Order order) {
        // Cập nhật đơn hàng mà không kiểm tra hoặc tạo lịch sử trạng thái
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
    }    @Override
    public List<Order> findByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<OrderSummaryDTO> findByUserIdAsDTO(Long userId) {
        try {
            List<Order> orders = orderRepository.findByUserId(userId);
            System.out.println("Converting " + orders.size() + " orders to DTOs");
            
            return orders.stream().map(this::convertToOrderSummaryDTO).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error converting orders to DTOs: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }      private OrderSummaryDTO convertToOrderSummaryDTO(Order order) {
        try {
            OrderSummaryDTO dto = new OrderSummaryDTO();
            dto.setId(order.getId());
            dto.setUserId(order.getUser() != null ? order.getUser().getId() : null);
            dto.setUsername(order.getUser() != null ? order.getUser().getUsername() : null);
            dto.setOrderDate(order.getOrderDate());
            dto.setStatus(order.getStatus());
            dto.setTotalAmount(order.getTotalAmount());
              // Set customer information with default values if null
            if (order.getUser() != null) {
                dto.setCustomerId(order.getUser().getId());
                dto.setCustomerName(order.getUser().getFullname() != null ? 
                    order.getUser().getFullname() : order.getUser().getUsername());
                dto.setCustomerEmail(order.getUser().getEmail());
            } else {
                // Provide default values when user info is missing
                dto.setCustomerId(null);
                dto.setCustomerName("Khách hàng không xác định");
                dto.setCustomerEmail("");
            }
            
            // Set payment method safely
            if (order.getPayment() != null) {
                dto.setPaymentMethod(order.getPayment().getPaymentMethod() != null ? 
                    order.getPayment().getPaymentMethod().toString() : "Chưa xác định");
                dto.setPaymentStatus(order.getPayment().getStatus() != null ? 
                    order.getPayment().getStatus().toString() : "Chưa thanh toán");
            } else {
                dto.setPaymentMethod("Chưa xác định");
                dto.setPaymentStatus("Chưa thanh toán");
            }
            
            // Set item count and order details info safely
            if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
                dto.setItemCount(order.getOrderDetails().size());
                dto.setOrderDetailsCount(order.getOrderDetails().size());
                
                // Set first product name and store info
                OrderDetail firstDetail = order.getOrderDetails().iterator().next();
                if (firstDetail.getProduct() != null) {
                    dto.setFirstProductName(firstDetail.getProduct().getName());
                    if (firstDetail.getProduct().getStore() != null) {
                        dto.setStoreName(firstDetail.getProduct().getStore().getName());
                        dto.setStoreId(firstDetail.getProduct().getStore().getId());
                    } else {
                        dto.setStoreName("Cửa hàng không xác định");
                        dto.setStoreId(null);
                    }
                } else {
                    dto.setFirstProductName("Sản phẩm không xác định");
                }
            } else {
                // Provide default values when order details are missing
                dto.setItemCount(0);
                dto.setOrderDetailsCount(0);
                dto.setFirstProductName("Không có sản phẩm");
                dto.setStoreName("Không có cửa hàng");
                dto.setStoreId(null);
            }
            
            return dto;
        } catch (Exception e) {
            System.err.println("Error converting order " + order.getId() + " to DTO: " + e.getMessage());
            // Return a minimal DTO in case of error
            OrderSummaryDTO dto = new OrderSummaryDTO();
            dto.setId(order.getId());
            dto.setOrderDate(order.getOrderDate());
            dto.setStatus(order.getStatus());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setPaymentMethod("Lỗi tải dữ liệu");
            dto.setPaymentStatus("Không xác định");
            dto.setItemCount(0);
            dto.setOrderDetailsCount(0);
            return dto;
        }
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
            case "PENDING":
                return "Chờ xác nhận";
            case "PROCESSING":
                return "Đang xử lý";
            case "SHIPPING":
                return "Đang giao hàng";
            case "COMPLETED":
                return "Đã hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            // Add other statuses from your payment processing if needed
            case "PROCESSING_COD":
                return "Đang xử lý (COD)";
            case "AWAITING_PAYPAL_PAYMENT":
                return "Chờ thanh toán PayPal";
            case "AWAITING_STRIPE_PAYMENT":
                return "Chờ thanh toán Stripe";
            case "AWAITING_ZALOPAY_PAYMENT":
                return "Chờ thanh toán ZaloPay";
            case "AWAITING_MOMO_PAYMENT":
                return "Chờ thanh toán MoMo";
            case "PAYMENT_FAILED":
                return "Thanh toán thất bại";
            default:
                return statusCode;
        }
    }

    @Override
    public List<OrderStatusHistory> getOrderStatusHistory(Long orderId) {
        return orderStatusHistoryRepository.findByOrderId(orderId);
    }    @Override
    public void addOrderStatusHistory(Order order, String status, String note, Long userId) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order); // Set the order reference directly without lazy loading
        history.setStatus(status);
        history.setNote(note);
        history.setCreatedAt(new Date());

        if (userId != null) {
            User user = userRepository.findById(userId);
            history.setCreatedBy(user);
        }        // Save the history directly without accessing the lazy collection
        orderStatusHistoryRepository.save(history);
    }

    @Override
    public List<Order> findOrdersByStoreId(Long storeId) {
        return orderRepository.findOrdersByStoreId(storeId);
    }

    @Override
    public List<Order> findOrdersByStoreIdAndStatus(Long storeId, String status) {
        return orderRepository.findOrdersByStoreIdAndStatus(storeId, status);
    }

    @Override
    public List<Order> findOrdersBySellerId(Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId);
    }

    @Override
    public List<Order> findOrdersBySellerIdAndStatus(Long sellerId, String status) {
        return orderRepository.findOrdersBySellerIdAndStatus(sellerId, status);
    }    @Override
    public List<OrderSummaryDTO> findOrdersByStoreIdAsDTO(Long storeId) {
        List<Order> orders = orderRepository.findOrdersByStoreId(storeId);
        return orders.stream().map(this::convertToOrderSummaryDTO).collect(Collectors.toList());
    }

    @Override
    public List<OrderSummaryDTO> findOrdersBySellerIdAsDTO(Long sellerId) {
        List<Order> orders = orderRepository.findOrdersBySellerId(sellerId);
        return orders.stream().map(this::convertToOrderSummaryDTO).collect(Collectors.toList());
    }
}