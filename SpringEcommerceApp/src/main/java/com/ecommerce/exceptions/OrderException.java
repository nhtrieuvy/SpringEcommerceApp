package com.ecommerce.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OrderException extends RuntimeException {
    public OrderException(String message) {
        super(message);
    }
    
    public OrderException(String message, Throwable cause) {
        super(message, cause);
    }
    
    
    public static class OrderNotFoundException extends OrderException {
        public OrderNotFoundException(Long orderId) {
            super("Order not found with ID: " + orderId);
        }
    }
    
    public static class InvalidOrderStatusException extends OrderException {
        public InvalidOrderStatusException(String currentStatus, String newStatus) {
            super(String.format("Cannot change order status from '%s' to '%s'", currentStatus, newStatus));
        }
    }
    
    public static class OrderAlreadyProcessedException extends OrderException {
        public OrderAlreadyProcessedException(Long orderId) {
            super("Order has already been processed: " + orderId);
        }
    }
    
    public static class EmptyOrderException extends OrderException {
        public EmptyOrderException() {
            super("Order cannot be empty - must contain at least one item");
        }
    }
    
    public static class InvalidOrderTotalException extends OrderException {
        public InvalidOrderTotalException(double expected, double provided) {
            super(String.format("Order total mismatch. Expected: %.2f, Provided: %.2f", expected, provided));
        }
    }
}
