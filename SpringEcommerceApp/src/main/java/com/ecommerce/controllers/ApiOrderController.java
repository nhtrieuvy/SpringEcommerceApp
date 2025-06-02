package com.ecommerce.controllers;

import com.ecommerce.dtos.OrderDTO;
import com.ecommerce.dtos.OrderCreateDTO;
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
import com.ecommerce.services.RecentActivityService;
import com.ecommerce.services.OrderValidationService;
import com.ecommerce.utils.JwtUtils;
import com.ecommerce.utils.IpUtils;
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

public class ApiOrderController {
    @Autowired
    private OrderService orderService;
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
    @Autowired
    private RecentActivityService recentActivityService;
    @Autowired
    private OrderValidationService orderValidationService;

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
            Payment payment = paymentService.getPaymentByOrderId(id);
            List<OrderDetail> orderDetails = orderDetailService.findByOrderId(id);
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
            if (order.getOrderDate() == null) {
                order.setOrderDate(new Date());
            }
            if (order.getStatus() == null || order.getStatus().isEmpty()) {
                order.setStatus("PENDING");
            }
            orderService.save(order);
            String username = JwtUtils.extractUsernameFromRequest(request);
            User user = userService.findByUsername(username);
            if (user != null) {
                orderService.addOrderStatusHistory(order, order.getStatus(), "Order created", user.getId());
                String ipAddress = IpUtils.getClientIpAddress(request);
                recentActivityService.logOrderCreated(
                        user.getEmail(),
                        user.getFullname() != null ? user.getFullname() : user.getUsername(),
                        order.getId(),
                        ipAddress);
            }
            try {
                emailService.sendOrderConfirmationEmail(order);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
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
            String note = request.get("note");
            String previousStatus = order.getStatus();
            order.setStatus("PROCESSING");
            String statusNote = "Payment completed via " + (paymentMethod != null ? paymentMethod : "online payment");
            if (transactionId != null && !transactionId.isEmpty()) {
                statusNote += " (Transaction ID: " + transactionId + ")";
            }
            if (note != null && !note.isEmpty()) {
                statusNote += " - " + note;
            }
            orderService.updateWithoutHistory(order);
            if (user != null) {
                orderService.addOrderStatusHistory(order, "PROCESSING", statusNote, user.getId());
            }
            try {
                emailService.sendOrderStatusUpdateEmail(order, previousStatus, "PROCESSING");
            } catch (Exception e) {
                System.err.println("Failed to send payment completion email: " + e.getMessage());
            }
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
            }
            String previousStatus = order.getStatus();
            String username = JwtUtils.extractUsernameFromRequest(httpRequest);
            User user = userService.findByUsername(username);
            Long userId = user != null ? user.getId() : null;
            order.setStatus(status);
            if (note != null && !note.isEmpty()) {
                orderService.updateWithoutHistory(order);
                orderService.addOrderStatusHistory(order, status, note, userId);
            } else {
                orderService.update(order, userId);
            }
            if (user != null) {
                String ipAddress = IpUtils.getClientIpAddress(httpRequest);
                recentActivityService.logOrderStatusChanged(
                        user.getEmail(),
                        user.getFullname() != null ? user.getFullname() : user.getUsername(),
                        order.getId(),
                        status,
                        ipAddress);
            }
            try {
                emailService.sendOrderStatusUpdateEmail(order, previousStatus, status);
                System.out.println("Email notification sent successfully for order #" + order.getId());
            } catch (Exception e) {
                System.err.println("Failed to send order status update email: " + e.getMessage());
                e.printStackTrace();
            }
            Map<String, Object> safeOrderData = Map.of(
                    "id", order.getId(),
                    "status", order.getStatus(),
                    "orderDate", order.getOrderDate(),
                    "totalAmount", order.getTotalAmount(),
                    "user", Map.of("id", order.getUser().getId(), "fullname", order.getUser().getFullname()));
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
            String username = JwtUtils.extractUsernameFromRequest(httpRequest);
            User user = userService.findByUsername(username);
            boolean hasAccess = false;
            if (user != null) {
                if (user.hasRole("ADMIN") || user.hasRole("STAFF")) {
                    hasAccess = true;
                } else if (order.getUser() != null && order.getUser().getId().equals(user.getId())) {
                    hasAccess = true;
                } else if (user.hasRole("SELLER")) {
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
            Payment payment = paymentService.getPaymentByOrderId(id);
            List<OrderDetail> orderDetails = orderDetailService.findByOrderId(id);
            List<OrderStatusHistory> history = orderService.getOrderStatusHistory(id);
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
            if (order.getUser() != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", order.getUser().getId());
                userInfo.put("username", order.getUser().getUsername());
                userInfo.put("email", order.getUser().getEmail());
                userInfo.put("fullname", order.getUser().getFullname());
                userInfo.put("phone", order.getUser().getPhone());
                orderResponse.put("user", userInfo);
            }
            if (orderDetails != null && !orderDetails.isEmpty()) {
                List<Map<String, Object>> detailsList = new ArrayList<>();
                for (OrderDetail detail : orderDetails) {
                    Map<String, Object> detailMap = new HashMap<>();
                    detailMap.put("id", detail.getId());
                    detailMap.put("quantity", detail.getQuantity());
                    detailMap.put("unitPrice", detail.getPrice());
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
            String username = JwtUtils.extractUsernameFromRequest(request);
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User not found"));
            }
            OrderCreateDTO orderCreateDTO = convertToOrderCreateDTO(orderDTO, user.getId());
            try {
                orderValidationService.validateOrderCreation(orderCreateDTO);
            } catch (Exception validationException) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message",
                                "Validation failed: " + validationException.getMessage()));
            }
            Order order = new Order();
            order.setUser(user);
            order.setOrderDate(new Date());
            order.setStatus("PENDING");
            Payment payment = new Payment();
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
                payment.setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY);
            }
            payment.setAmount(orderDTO.getTotal() != null ? orderDTO.getTotal() : 0.0);
            payment.setStatus("PENDING");
            payment.setPaymentDate(new Date());
            order.setPaymentWithRelationship(payment);
            if (orderDTO.getShippingInfo() != null) {
                String fullAddress = orderDTO.getShippingInfo().get("address");
                if (orderDTO.getShippingInfo().get("city") != null) {
                    fullAddress += ", " + orderDTO.getShippingInfo().get("city");
                }
                if (orderDTO.getShippingInfo().get("district") != null) {
                    fullAddress += ", " + orderDTO.getShippingInfo().get("district");
                }
                order.setShippingAddress(fullAddress);
                order.setAddress(fullAddress);
                order.setPhoneNumber(orderDTO.getShippingInfo().get("phone"));
                StringBuilder notes = new StringBuilder();
                notes.append("Recipient: ").append(orderDTO.getShippingInfo().get("fullName"));
                if (orderDTO.getShippingInfo().get("notes") != null
                        && !orderDTO.getShippingInfo().get("notes").isEmpty()) {
                    notes.append("\nNotes: ").append(orderDTO.getShippingInfo().get("notes"));
                }
                order.setNotes(notes.toString());
            }
            if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
                for (OrderDTO.OrderItemDTO itemDTO : orderDTO.getItems()) {
                    OrderDetail detail = new OrderDetail();
                    Product product = productService.findById(itemDTO.getProductId());
                    if (product != null) {
                        detail.setProduct(product);
                        detail.setQuantity(itemDTO.getQuantity());
                        detail.setPrice(itemDTO.getPrice());
                        order.addOrderDetail(detail);
                    }
                }
            }
            double calculatedTotal = order.calculateTotalAmount();
            if (calculatedTotal == 0 && orderDTO.getTotal() != null) {
                order.setTotalAmount(orderDTO.getTotal());
            }
            if (orderDTO.getShipping() != null) {
                order.setShippingFee(orderDTO.getShipping());
            }
            payment.setAmount(order.getTotalAmount());
            if (!order.hasItems()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Order must contain at least one item"));
            }
            try {
                payment.validate();
            } catch (IllegalStateException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", e.getMessage()));
            }
            OrderStatusHistory initialStatus = new OrderStatusHistory(order, order.getStatus(), "Order created", user);
            order.addStatusHistory(initialStatus);
            orderService.save(order);
            String ipAddress = IpUtils.getClientIpAddress(request);
            recentActivityService.logOrderCreated(
                    user.getEmail(),
                    user.getFullname() != null ? user.getFullname() : user.getUsername(),
                    order.getId(),
                    ipAddress);
            try {
                emailService.sendOrderConfirmationEmail(order);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
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
                    : order.getTotalAmount();
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
                if (payment.getPaymentMethod() != PaymentMethod.PAYPAL) {
                    System.out.println("WARNING: Payment method was " + payment.getPaymentMethod() +
                            ", updating to PAYPAL for PayPal completion");
                    payment.setPaymentMethod(PaymentMethod.PAYPAL);
                }
            }
            System.out.println("Setting payment status to COMPLETED...");
            payment.setStatus("COMPLETED");
            payment.setTransactionId(paypalOrderId);
            payment.setPaypalPayerId(paypalPayerId);
            payment.setPaypalCaptureId(captureId);
            payment.setPaymentDate(new Date());
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
                throw paymentException;
            }
            String previousStatus = order.getStatus();
            order.setStatus("PROCESSING");
            String statusNote = "PayPal payment completed (Order ID: " + paypalOrderId +
                    ", Capture ID: " + captureId + ")";
            orderService.updateWithoutHistory(order);
            if (user != null) {
                orderService.addOrderStatusHistory(order, "PROCESSING", statusNote, user.getId());
            }
            try {
                emailService.sendOrderStatusUpdateEmail(order, previousStatus, "PROCESSING");
            } catch (Exception e) {
                System.err.println("Failed to send payment completion email: " + e.getMessage());
            }
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
            List<OrderSummaryDTO> orderDTOs = orderService.findOrdersByStoreIdAsDTO(storeId);
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
            List<OrderSummaryDTO> orderDTOs = orderService.findOrdersBySellerIdAsDTO(user.getId());
            System.out.println("Orders found for seller ID " + user.getId() + ": " + orderDTOs.size());
            if (!orderDTOs.isEmpty()) {
                OrderSummaryDTO firstOrder = orderDTOs.get(0);
                System.out.println("Sample order data - ID: " + firstOrder.getId()
                        + ", Customer: " + firstOrder.getCustomerName()
                        + ", Store: " + firstOrder.getStoreName()
                        + ", First Product: " + firstOrder.getFirstProductName());
            }
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

    private OrderCreateDTO convertToOrderCreateDTO(OrderDTO orderDTO, Long userId) {
        OrderCreateDTO createDTO = new OrderCreateDTO();
        createDTO.setUserId(userId);
        createDTO.setPaymentMethod(orderDTO.getPaymentMethod());
        double calculatedSubtotal = 0.0;
        if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
            for (OrderDTO.OrderItemDTO item : orderDTO.getItems()) {
                if (item.getPrice() != null && item.getQuantity() != null) {
                    calculatedSubtotal += item.getPrice() * item.getQuantity();
                }
            }
        }
        createDTO.setSubtotal(calculatedSubtotal);
        if (orderDTO.getShipping() != null) {
            createDTO.setShipping(orderDTO.getShipping());
        } else {
            createDTO.setShipping(0.0);
        }
        createDTO.setTotal(orderDTO.getTotal() != null ? orderDTO.getTotal() : calculatedSubtotal);
        if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
            List<OrderCreateDTO.OrderItemCreateDTO> items = new ArrayList<>();
            for (OrderDTO.OrderItemDTO itemDTO : orderDTO.getItems()) {
                OrderCreateDTO.OrderItemCreateDTO createItem = new OrderCreateDTO.OrderItemCreateDTO();
                createItem.setProductId(itemDTO.getProductId());
                createItem.setQuantity(itemDTO.getQuantity());
                createItem.setPrice(itemDTO.getPrice());
                items.add(createItem);
            }
            createDTO.setItems(items);
        }
        if (orderDTO.getShippingInfo() != null) {
            createDTO.setShippingInfo(orderDTO.getShippingInfo());
        }
        return createDTO;
    }
}
