package com.ecommerce.controllers;

import com.ecommerce.dtos.OrderDTO;
import com.ecommerce.dtos.OrderSummaryDTO;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderDetail;
import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.pojo.Payment;
import com.ecommerce.pojo.PaymentMethod;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.services.OrderService;
import com.ecommerce.services.PaymentService;
import com.ecommerce.services.OrderDetailService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.UserService;
import com.ecommerce.services.EmailService;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.utils.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class ApiOrderController {
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailService orderDetailService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private EmailService emailService;

    @GetMapping("")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            List<Order> orders = orderService.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            Payment payment = paymentService.getPaymentByOrderId(id);            List<OrderDetail> orderDetails = orderDetailService.findByOrderId(id);
            
            // Create a safe response without circular references
            Map<String, Object> orderResponse = new HashMap<>();
            orderResponse.put("id", order.getId());
            orderResponse.put("orderDate", order.getOrderDate());
            orderResponse.put("status", order.getStatus());
            orderResponse.put("totalAmount", order.getTotalAmount());
            orderResponse.put("address", order.getAddress());
            orderResponse.put("shippingAddress", order.getShippingAddress());
            orderResponse.put("phoneNumber", order.getPhoneNumber());
            orderResponse.put("notes", order.getNotes());

            if (payment != null) {
                Map<String, Object> paymentInfo = new HashMap<>();
                paymentInfo.put("id", payment.getId());
                paymentInfo.put("status", payment.getStatus());
                paymentInfo.put("paymentMethod", payment.getPaymentMethod().toString());
                paymentInfo.put("amount", payment.getAmount());
                paymentInfo.put("transactionId", payment.getTransactionId());
                paymentInfo.put("paymentDate", payment.getPaymentDate());
                orderResponse.put("payment", paymentInfo);
            }
            // Add user info safely
            if (order.getUser() != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", order.getUser().getId());
                userInfo.put("username", order.getUser().getUsername());
                userInfo.put("email", order.getUser().getEmail());
                userInfo.put("fullname", order.getUser().getFullname());
                orderResponse.put("user", userInfo);
            }
            if (orderDetails != null && !orderDetails.isEmpty()) {
                List<Map<String, Object>> detailsList = new ArrayList<>();
                for (OrderDetail detail : orderDetails) {
                    Map<String, Object> detailMap = new HashMap<>();
                    detailMap.put("id", detail.getId());
                    detailMap.put("quantity", detail.getQuantity());
                    detailMap.put("unitPrice", detail.getPrice());

                    // Thêm thông tin sản phẩm
                    if (detail.getProduct() != null) {
                        Map<String, Object> productInfo = new HashMap<>();
                        productInfo.put("id", detail.getProduct().getId());
                        productInfo.put("name", detail.getProduct().getName());
                        productInfo.put("image", detail.getProduct().getImage());
                        productInfo.put("store",
                                detail.getProduct().getStore() != null
                                        ? Map.of("id", detail.getProduct().getStore().getId(), "name",
                                                detail.getProduct().getStore().getName())
                                        : null);
                        detailMap.put("product", productInfo);
                    }
                    detailsList.add(detailMap);
                }
                orderResponse.put("orderDetails", detailsList);
            }

            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.findByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(HttpServletRequest request) {
        try {
            // Extract username from token
            String authHeader = request.getHeader("Authorization");
            String jwtToken = null;
            String username = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwtToken = authHeader.substring(7);
                username = JwtUtils.extractUsername(jwtToken);
            }

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Unauthorized"));
            }

            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "User not found"));
            }
            try {
                List<OrderSummaryDTO> orders = orderService.findByUserIdAsDTO(user.getId());
                System.out.println("Controller: About to return " + orders.size() + " order DTOs to frontend");

                return ResponseEntity.ok(orders);
            } catch (Exception e) {
                // Log the specific error from order service
                System.err.println("Error fetching orders for user " + user.getId() + ": " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "Lỗi khi tải dữ liệu đơn hàng: " + e.getMessage()));
            }
        } catch (Exception e) {
            System.err.println("Unexpected error in getMyOrders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PostMapping(value = "", consumes = "application/json")
    public ResponseEntity<?> createOrder(@RequestBody Order order, HttpServletRequest request) {
        try {
            // Set the order date to current time
            if (order.getOrderDate() == null) {
                order.setOrderDate(new Date());
            }

            // Set initial status if not provided
            if (order.getStatus() == null || order.getStatus().isEmpty()) {
                order.setStatus("PENDING");
            } // Save the order
            orderService.save(order);

            // Add order status history
            String username = JwtUtils.extractUsernameFromRequest(request);
            User user = userService.findByUsername(username);

            if (user != null) {
                orderService.addOrderStatusHistory(order, order.getStatus(), "Order created", user.getId());
            }

            // Send order confirmation email
            try {
                emailService.sendOrderConfirmationEmail(order);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
                // Don't fail the order creation if email fails
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order created successfully",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/payment-completed")
    public ResponseEntity<?> markPaymentCompleted(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            // Verify that the order belongs to the current user (unless admin/staff)
            String username = JwtUtils.extractUsernameFromRequest(httpRequest);
            User user = userService.findByUsername(username);

            if (user != null && !user.hasRole("ADMIN") &&
                    !user.hasRole("STAFF") &&
                    !order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Access denied"));
            }

            String paymentMethod = request.get("paymentMethod");
            String transactionId = request.get("transactionId");
            String note = request.get("note");            // Update order status to PROCESSING (payment completed)
            String previousStatus = order.getStatus();
            order.setStatus("PROCESSING");
            
            // Create custom note for payment completion
            String statusNote = "Payment completed via " + (paymentMethod != null ? paymentMethod : "online payment");
            if (transactionId != null && !transactionId.isEmpty()) {
                statusNote += " (Transaction ID: " + transactionId + ")";
            }
            if (note != null && !note.isEmpty()) {
                statusNote += " - " + note;
            }
              // Since we always have a payment note, use update without history
            orderService.updateWithoutHistory(order);
            
            // And manually add the history with the payment note
            if (user != null) {
                orderService.addOrderStatusHistory(order, "PROCESSING", statusNote, user.getId());
            }

            // Send status update email
            try {
                emailService.sendOrderStatusUpdateEmail(order, previousStatus, "PROCESSING");
            } catch (Exception e) {
                System.err.println("Failed to send payment completion email: " + e.getMessage());
                // Don't fail the status update if email fails
            } // Create a safe response without lazy-loaded collections
            Map<String, Object> orderResponse = Map.of(
                    "id", order.getId(),
                    "status", order.getStatus(),
                    "totalAmount", order.getTotalAmount(),
                    "orderDate", order.getOrderDate(),
                    "userId", order.getUser().getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment completed successfully",
                    "order", orderResponse));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            String status = request.get("status");
            String note = request.get("note");

            if (status == null || status.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Status is required"));
            } // Update order status            // Store previous status for email notification and response message
            String previousStatus = order.getStatus();

            // Get user info before updating order
            String username = JwtUtils.extractUsernameFromRequest(httpRequest);
            User user = userService.findByUsername(username);
            Long userId = user != null ? user.getId() : null;
              // Set new status in the order object
            order.setStatus(status);            // Option 1: Manual update with custom note (for when user provides a note)
            if (note != null && !note.isEmpty()) {
                // Update order without creating history entry
                orderService.updateWithoutHistory(order);
                
                // Add history with user-provided note
                orderService.addOrderStatusHistory(order, status, note, userId);
            } 
            // Option 2: Normal update (for when no note is provided)
            else {
                // Let the orderService.update method create the default history entry with user ID
                orderService.update(order, userId);
            }
            
            // Send status update email
            try {
                emailService.sendOrderStatusUpdateEmail(order, previousStatus, status);
                System.out.println("Email notification sent successfully for order #" + order.getId());
            } catch (Exception e) {
                System.err.println("Failed to send order status update email: " + e.getMessage());
                e.printStackTrace();
                // Don't fail the status update if email fails, just log it
            }
            
            // Create a safe response object without lazy-loaded collections that might cause serialization issues
            Map<String, Object> safeOrderData = Map.of(
                "id", order.getId(),
                "status", order.getStatus(),
                "orderDate", order.getOrderDate(),
                "totalAmount", order.getTotalAmount(),
                "user", Map.of("id", order.getUser().getId(), "fullname", order.getUser().getFullname())
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order status updated from " + previousStatus + " to " + status,
                    "order", safeOrderData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getOrderStatusHistory(@PathVariable Long id) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            List<OrderStatusHistory> history = orderService.getOrderStatusHistory(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "history", history));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            List<OrderDetail> details = orderDetailService.findByOrderId(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "details", details));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<?> getOrderFullDetails(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            // Kiểm tra quyền truy cập vào đơn hàng
            String username = JwtUtils.extractUsernameFromRequest(httpRequest);
            User user = userService.findByUsername(username);

            // Chỉ cho phép Admin, Staff hoặc người dùng sở hữu đơn hàng, hoặc người bán có
            // sản phẩm trong đơn hàng
            boolean hasAccess = false;
            if (user != null) {
                if (user.hasRole("ADMIN") || user.hasRole("STAFF")) {
                    hasAccess = true;
                } else if (order.getUser() != null && order.getUser().getId().equals(user.getId())) {
                    hasAccess = true;
                } else if (user.hasRole("SELLER")) {
                    // Kiểm tra xem người bán có sản phẩm nào trong đơn hàng không
                    if (order.getOrderDetails() != null) {
                        for (OrderDetail detail : order.getOrderDetails()) {
                            if (detail.getProduct() != null
                                    && detail.getProduct().getStore() != null
                                    && detail.getProduct().getStore().getSeller() != null
                                    && detail.getProduct().getStore().getSeller().getId().equals(user.getId())) {
                                hasAccess = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Access denied"));
            }

            // Lấy thông tin thanh toán
            Payment payment = paymentService.getPaymentByOrderId(id);

            // Lấy chi tiết đơn hàng
            List<OrderDetail> orderDetails = orderDetailService.findByOrderId(id);

            // Lấy lịch sử trạng thái
            List<OrderStatusHistory> history = orderService.getOrderStatusHistory(id);            // Tạo response object
            Map<String, Object> orderResponse = new HashMap<>();
            orderResponse.put("id", order.getId());
            orderResponse.put("orderDate", order.getOrderDate());
            orderResponse.put("status", order.getStatus());
            orderResponse.put("totalAmount", order.getTotalAmount());
            orderResponse.put("address", order.getAddress());
            orderResponse.put("shippingAddress", order.getShippingAddress());
            orderResponse.put("phoneNumber", order.getPhoneNumber());
            orderResponse.put("notes", order.getNotes());

            // Thêm thông tin thanh toán
            if (payment != null) {
                Map<String, Object> paymentInfo = new HashMap<>();
                paymentInfo.put("id", payment.getId());
                paymentInfo.put("status", payment.getStatus());
                paymentInfo.put("paymentMethod", payment.getPaymentMethod().toString());
                paymentInfo.put("amount", payment.getAmount());
                paymentInfo.put("transactionId", payment.getTransactionId());
                paymentInfo.put("paymentDate", payment.getPaymentDate());
                orderResponse.put("payment", paymentInfo);
            }

            // Thêm thông tin người dùng
            if (order.getUser() != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", order.getUser().getId());
                userInfo.put("username", order.getUser().getUsername());
                userInfo.put("email", order.getUser().getEmail());
                userInfo.put("fullname", order.getUser().getFullname());
                userInfo.put("phone", order.getUser().getPhone());
                orderResponse.put("user", userInfo);
            }

            // Thêm thông tin chi tiết sản phẩm
            if (orderDetails != null && !orderDetails.isEmpty()) {
                List<Map<String, Object>> detailsList = new ArrayList<>();
                for (OrderDetail detail : orderDetails) {
                    Map<String, Object> detailMap = new HashMap<>();
                    detailMap.put("id", detail.getId());
                    detailMap.put("quantity", detail.getQuantity());
                    detailMap.put("unitPrice", detail.getPrice());

                    // Thêm thông tin sản phẩm
                    if (detail.getProduct() != null) {
                        Map<String, Object> productInfo = new HashMap<>();
                        productInfo.put("id", detail.getProduct().getId());
                        productInfo.put("name", detail.getProduct().getName());
                        productInfo.put("image", detail.getProduct().getImage());
                        productInfo.put("store",
                                detail.getProduct().getStore() != null
                                        ? Map.of("id", detail.getProduct().getStore().getId(), "name",
                                                detail.getProduct().getStore().getName())
                                        : null);
                        detailMap.put("product", productInfo);
                    }
                    detailsList.add(detailMap);
                }
                orderResponse.put("orderDetails", detailsList);
            }            // Thêm lịch sử trạng thái
            if (history != null && !history.isEmpty()) {
                List<Map<String, Object>> historyList = new ArrayList<>();
                for (OrderStatusHistory statusHistory : history) {
                    Map<String, Object> historyMap = new HashMap<>();
                    historyMap.put("id", statusHistory.getId());
                    historyMap.put("status", statusHistory.getStatus());
                    historyMap.put("note", statusHistory.getNote());
                    historyMap.put("createdAt", statusHistory.getCreatedAt());
                    historyMap.put("createdBy",
                            statusHistory.getCreatedBy() != null ? statusHistory.getCreatedBy().getUsername() : null);
                    historyList.add(historyMap);
                }
                orderResponse.put("history", historyList);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "order", orderResponse));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping(value = "/create-order", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createOrderFromDTO(@RequestBody OrderDTO orderDTO, HttpServletRequest request) {
        try {
            // Get the authenticated user
            String username = JwtUtils.extractUsernameFromRequest(request);
            User user = userService.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User not found"));
            }

            // Create a new order
            Order order = new Order();
            order.setUser(user);
            order.setOrderDate(new Date());
            order.setStatus("PENDING");
            // We'll calculate the total based on order items later

            // Create a Payment entity for the payment method
            Payment payment = new Payment(); // Set payment method with validation
            try {
                String paymentMethodStr = orderDTO.getPaymentMethod();
                System.out.println("DEBUG: Received payment method: '" + paymentMethodStr + "'");

                PaymentMethod paymentMethod = PaymentMethod
                        .valueOf(paymentMethodStr != null ? paymentMethodStr.toUpperCase()
                                : PaymentMethod.CASH_ON_DELIVERY.name());
                payment.setPaymentMethod(paymentMethod);

                System.out.println("DEBUG: Successfully set payment method to: " + paymentMethod);
            } catch (IllegalArgumentException e) {
                System.err.println("ERROR: Invalid payment method '" + orderDTO.getPaymentMethod() +
                        "', falling back to CASH_ON_DELIVERY. Error: " + e.getMessage());
                // Default to CASH_ON_DELIVERY if invalid payment method
                payment.setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY);
            }

            payment.setAmount(orderDTO.getTotal() != null ? orderDTO.getTotal() : 0.0);
            payment.setStatus("PENDING");
            payment.setPaymentDate(new Date());

            // Use helper method to maintain bidirectional relationship
            order.setPaymentWithRelationship(payment);            // Add shipping info to order fields
            if (orderDTO.getShippingInfo() != null) {
                // Set shipping address combining address, city, and district
                String fullAddress = orderDTO.getShippingInfo().get("address");
                if (orderDTO.getShippingInfo().get("city") != null) {
                    fullAddress += ", " + orderDTO.getShippingInfo().get("city");
                }
                if (orderDTO.getShippingInfo().get("district") != null) {
                    fullAddress += ", " + orderDTO.getShippingInfo().get("district");
                }
                order.setShippingAddress(fullAddress);
                
                // Set user address as the billing address
                order.setAddress(fullAddress);
                
                // Set phone number
                order.setPhoneNumber(orderDTO.getShippingInfo().get("phone"));
                
                // Set additional notes
                StringBuilder notes = new StringBuilder();
                notes.append("Recipient: ").append(orderDTO.getShippingInfo().get("fullName"));
                if (orderDTO.getShippingInfo().get("notes") != null && !orderDTO.getShippingInfo().get("notes").isEmpty()) {
                    notes.append("\nNotes: ").append(orderDTO.getShippingInfo().get("notes"));
                }
                order.setNotes(notes.toString());
            }

            // Process order items before saving
            if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
                for (OrderDTO.OrderItemDTO itemDTO : orderDTO.getItems()) {
                    OrderDetail detail = new OrderDetail();
                    // Get product reference
                    Product product = productService.findById(itemDTO.getProductId());
                    if (product != null) {
                        detail.setProduct(product);
                        detail.setQuantity(itemDTO.getQuantity());
                        detail.setPrice(itemDTO.getPrice());
                        // Use helper method to maintain bidirectional relationship
                        order.addOrderDetail(detail);
                        // No need to explicitly save OrderDetail with proper cascade settings
                    }
                }
            }

            // Calculate the total amount based on order items
            double calculatedTotal = order.calculateTotalAmount();

            // If the calculated total is 0 but we have a DTO total, use it as fallback
            if (calculatedTotal == 0 && orderDTO.getTotal() != null) {
                order.setTotalAmount(orderDTO.getTotal());
            }

            // Update payment amount to match the order total
            payment.setAmount(order.getTotalAmount());
            // Validate the order has items
            if (!order.hasItems()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Order must contain at least one item"));
            }

            // Validate payment data
            try {
                payment.validate();
            } catch (IllegalStateException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", e.getMessage()));
            }

            // Create initial order status history entry directly using the helper method
            OrderStatusHistory initialStatus = new OrderStatusHistory(order, order.getStatus(), "Order created", user);
            order.addStatusHistory(initialStatus);
            // Save the order with all its relationships in one transaction
            // With proper cascade settings, this will save order details and payment
            // automatically
            orderService.save(order);

            // Send order confirmation email
            try {
                emailService.sendOrderConfirmationEmail(order);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
                // Don't fail the order creation if email fails
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order created successfully",
                    "order", Map.of("id", order.getId(), "status", order.getStatus())));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/paypal-payment-completed")
    @Transactional
    public ResponseEntity<?> markPayPalPaymentCompleted(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        try {
            Order order = orderService.findById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Order not found"));
            }

            // Verify that the order belongs to the current user (unless admin/staff)
            String username = JwtUtils.extractUsernameFromRequest(httpRequest);
            User user = userService.findByUsername(username);

            if (user != null && !user.hasRole("ADMIN") &&
                    !user.hasRole("STAFF") &&
                    !order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Access denied"));
            }
            String paypalOrderId = (String) request.get("paypalOrderId");
            String paypalPayerId = (String) request.get("paypalPayerId");
            String captureId = (String) request.get("captureId");
            Double amount = request.get("amount") != null ? Double.valueOf(request.get("amount").toString())
                    : order.getTotalAmount(); // Create or update payment record
            Payment payment = paymentService.getPaymentByOrderId(order.getId());
            boolean isNewPayment = false;
            if (payment == null) {
                System.out.println("DEBUG: Creating new payment record for order: " + order.getId());
                payment = new Payment();
                payment.setOrder(order);
                payment.setPaymentMethod(PaymentMethod.PAYPAL);
                payment.setAmount(amount);
                isNewPayment = true;
            } else {
                System.out.println("DEBUG: Updating existing payment record: " + payment.getId() +
                        " with current PaymentMethod: " + payment.getPaymentMethod() +
                        " and status: " + payment.getStatus());

                // CRITICAL FIX: Force update payment method to PAYPAL for PayPal payments
                if (payment.getPaymentMethod() != PaymentMethod.PAYPAL) {
                    System.out.println("WARNING: Payment method was " + payment.getPaymentMethod() +
                            ", updating to PAYPAL for PayPal completion");
                    payment.setPaymentMethod(PaymentMethod.PAYPAL);
                }
            }

            // Update payment information
            System.out.println("Setting payment status to COMPLETED...");
            payment.setStatus("COMPLETED");
            payment.setTransactionId(paypalOrderId);
            payment.setPaypalPayerId(paypalPayerId);
            payment.setPaypalCaptureId(captureId);
            payment.setPaymentDate(new Date());

            // Save or update payment
            try {
                if (isNewPayment) {
                    Payment savedPayment = paymentService.save(payment);
                    System.out.println("Payment saved successfully with ID: " + savedPayment.getId() + " and status: "
                            + savedPayment.getStatus());
                } else {
                    Payment updatedPayment = paymentService.update(payment);
                    System.out.println("Payment updated successfully: ID=" + updatedPayment.getId() + ", Status="
                            + updatedPayment.getStatus());
                }
            } catch (Exception paymentException) {
                System.err.println("Error saving/updating payment: " + paymentException.getMessage());
                paymentException.printStackTrace();
                throw paymentException; // Re-throw to handle in outer catch
            }            // Update order status to PROCESSING (payment completed)
            String previousStatus = order.getStatus();
            order.setStatus("PROCESSING");
            
            // Create custom note for PayPal payment
            String statusNote = "PayPal payment completed (Order ID: " + paypalOrderId +
                    ", Capture ID: " + captureId + ")";
              // Use service method to avoid duplicate history entries
            orderService.updateWithoutHistory(order);

            // Manually add history entry with PayPal details
            if (user != null) {
                orderService.addOrderStatusHistory(order, "PROCESSING", statusNote, user.getId());
            }

            // Send status update email
            try {
                emailService.sendOrderStatusUpdateEmail(order, previousStatus, "PROCESSING");
            } catch (Exception e) {
                System.err.println("Failed to send payment completion email: " + e.getMessage());
                // Don't fail the status update if email fails
            } // Create a safe response without lazy-loaded collections
            Map<String, Object> orderResponse = Map.of(
                    "id", order.getId(),
                    "status", order.getStatus(),
                    "totalAmount", order.getTotalAmount(),
                    "orderDate", order.getOrderDate(),
                    "userId", order.getUser().getId());

            Map<String, Object> paymentResponse = Map.of(
                    "id", payment.getId(),
                    "status", payment.getStatus(),
                    "amount", payment.getAmount(),
                    "paymentMethod", payment.getPaymentMethod().toString(),
                    "transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "",
                    "paymentDate", payment.getPaymentDate());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "PayPal payment completed successfully",
                    "order", orderResponse,
                    "payment", paymentResponse));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/seller/store/{storeId}")
    public ResponseEntity<?> getOrdersByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            // Extract username from token
            String authHeader = request.getHeader("Authorization");
            String jwtToken = null;
            String username = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwtToken = authHeader.substring(7);
                username = JwtUtils.extractUsername(jwtToken);
            }

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Unauthorized"));
            }

            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "User not found"));
            }            // Sử dụng phương thức có sẵn trong OrderService để chuyển đổi sang DTO
            // Phương thức này xử lý đầy đủ các thông tin khách hàng, cửa hàng, sản phẩm
            List<OrderSummaryDTO> orderDTOs = orderService.findOrdersByStoreIdAsDTO(storeId);
            
            // Áp dụng lọc status sau khi đã chuyển đổi sang DTO
            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                orderDTOs = orderDTOs.stream()
                        .filter(dto -> dto.getStatus().equals(status))
                        .collect(java.util.stream.Collectors.toList());
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orders", orderDTOs,
                    "totalElements", orderDTOs.size()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error fetching orders: " + e.getMessage()));
        }
    }

    @GetMapping("/seller/all")
    public ResponseEntity<?> getAllOrdersForSeller(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            // Extract username from token
            String authHeader = request.getHeader("Authorization");
            String jwtToken = null;
            String username = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwtToken = authHeader.substring(7);
                username = JwtUtils.extractUsername(jwtToken);
            }

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Unauthorized"));
            }

            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "User not found"));
            }            // Sử dụng phương thức có sẵn trong OrderService để chuyển đổi sang DTO
            // Phương thức này xử lý đầy đủ các thông tin khách hàng, cửa hàng, sản phẩm
            List<OrderSummaryDTO> orderDTOs = orderService.findOrdersBySellerIdAsDTO(user.getId());
            
            // Log thông tin để debug
            System.out.println("Orders found for seller ID " + user.getId() + ": " + orderDTOs.size());
            if (!orderDTOs.isEmpty()) {
                OrderSummaryDTO firstOrder = orderDTOs.get(0);
                System.out.println("Sample order data - ID: " + firstOrder.getId() 
                    + ", Customer: " + firstOrder.getCustomerName()
                    + ", Store: " + firstOrder.getStoreName()
                    + ", First Product: " + firstOrder.getFirstProductName());
            }
            
            // Áp dụng lọc status sau khi đã chuyển đổi sang DTO
            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                orderDTOs = orderDTOs.stream()
                        .filter(dto -> dto.getStatus().equals(status))
                        .collect(java.util.stream.Collectors.toList());
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orders", orderDTOs,
                    "totalElements", orderDTOs.size()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error fetching orders: " + e.getMessage()));
        }
    }
}
