package com.ecommerce.services.impl;

import com.ecommerce.dtos.OrderCreateDTO;
import com.ecommerce.exceptions.OrderException;
import com.ecommerce.exceptions.ProductException;
import com.ecommerce.exceptions.UserException;
import com.ecommerce.pojo.*;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.services.OrderDetailService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.UserService;
import com.ecommerce.services.OrderValidationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;

/**
 * Enhanced Order Validation Service with comprehensive business logic validation
 */
@Service
@Transactional
public class OrderValidationServiceImpl implements OrderValidationService {

    @Autowired
    private UserService userService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderRepository orderRepository;

    @Override
    public void validateOrderCreation(OrderCreateDTO orderDTO) {
        validateUser(orderDTO.getUserId());
        validateOrderItems(orderDTO);
        validatePaymentMethod(orderDTO.getPaymentMethod());
        validateOrderTotals(orderDTO);
    }

    @Override
    public void validateOrderUpdate(Order existingOrder, Order updatedOrder) {
        if (existingOrder == null) {
            throw new OrderException.OrderNotFoundException(updatedOrder.getId());
        }
        
        // Validate status transition
        validateStatusTransition(existingOrder.getStatus(), updatedOrder.getStatus());
        
        // Check if order can be modified
        if (!canModifyOrder(existingOrder)) {
            throw new OrderException("Cannot modify order in current status: " + existingOrder.getStatus());
        }
    }

    @Override
    public void validateStockAvailability(Long productId, int requestedQuantity) {
        Product product = productService.findById(productId);
        if (product == null) {
            throw new ProductException.ProductNotFoundException(productId);
        }
        
        if (!product.isActive()) {
            throw new ProductException("Product is not active: " + product.getName());
        }
        
        if (product.getQuantity() < requestedQuantity) {
            throw new ProductException.InsufficientStockException(
                product.getName(), requestedQuantity, product.getQuantity());
        }
    }

    private void validateUser(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new UserException.UserNotFoundException("User ID: " + userId);
        }
        
        if (!user.isActive()) {
            throw new UserException.InactiveUserException(user.getUsername());
        }
    }

    private void validateOrderItems(OrderCreateDTO orderDTO) {
        if (orderDTO.getItems() == null || orderDTO.getItems().isEmpty()) {
            throw new OrderException("Order must contain at least one item");
        }
        
        double calculatedSubtotal = 0.0;
        
        for (OrderCreateDTO.OrderItemCreateDTO item : orderDTO.getItems()) {
            // Validate stock availability
            validateStockAvailability(item.getProductId(), item.getQuantity());
            
            // Validate price consistency
            Product product = productService.findById(item.getProductId());
            if (!isPriceValid(product.getPrice(), item.getPrice())) {
                throw new OrderException("Price mismatch for product: " + product.getName());
            }
            
            calculatedSubtotal += item.getPrice() * item.getQuantity();
        }
        
        // Validate subtotal calculation
        if (!isAmountValid(calculatedSubtotal, orderDTO.getSubtotal())) {
            throw new OrderException("Subtotal calculation error. Expected: " + calculatedSubtotal 
                + ", Received: " + orderDTO.getSubtotal());
        }
    }

    private void validatePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            throw new OrderException("Payment method is required");
        }
        
        // Validate against allowed payment methods
        String[] allowedMethods = {"CASH", "CARD", "PAYPAL", "MOMO", "BANK_TRANSFER"};
        boolean isValid = false;
        for (String method : allowedMethods) {
            if (method.equalsIgnoreCase(paymentMethod.trim())) {
                isValid = true;
                break;
            }
        }
        
        if (!isValid) {
            throw new OrderException("Invalid payment method: " + paymentMethod);
        }
    }

    private void validateOrderTotals(OrderCreateDTO orderDTO) {
        if (orderDTO.getSubtotal() == null || orderDTO.getSubtotal() <= 0) {
            throw new OrderException("Subtotal must be greater than 0");
        }
        
        if (orderDTO.getShipping() == null || orderDTO.getShipping() < 0) {
            throw new OrderException("Shipping cost cannot be negative");
        }
        
        double expectedTotal = orderDTO.getSubtotal() + orderDTO.getShipping();
        // Note: Total calculation should be validated if provided in DTO
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Business rules for status transitions
        if ("CANCELLED".equals(currentStatus) || "COMPLETED".equals(currentStatus)) {
            throw new OrderException("Cannot change status from: " + currentStatus);
        }
        
        if ("PENDING".equals(currentStatus) && "COMPLETED".equals(newStatus)) {
            throw new OrderException("Order must be processed before completion");
        }
    }

    private boolean canModifyOrder(Order order) {
        return "PENDING".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus());
    }

    private boolean isPriceValid(double productPrice, double orderPrice) {
        // Allow small floating point differences
        return Math.abs(productPrice - orderPrice) < 0.01;
    }

    private boolean isAmountValid(double calculated, double provided) {
        // Round to 2 decimal places for comparison
        BigDecimal calc = BigDecimal.valueOf(calculated).setScale(2, RoundingMode.HALF_UP);
        BigDecimal prov = BigDecimal.valueOf(provided).setScale(2, RoundingMode.HALF_UP);
        return calc.equals(prov);
    }
}
