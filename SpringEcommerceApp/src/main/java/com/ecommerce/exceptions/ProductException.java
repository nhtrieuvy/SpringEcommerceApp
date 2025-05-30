package com.ecommerce.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception for product-related business logic errors
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ProductException extends RuntimeException {
    
    public ProductException(String message) {
        super(message);
    }
    
    public ProductException(String message, Throwable cause) {
        super(message, cause);
    }
    
    // Specific product error types
    public static class ProductNotFoundException extends ProductException {
        public ProductNotFoundException(Long productId) {
            super("Product not found with ID: " + productId);
        }
    }
    
    public static class InsufficientStockException extends ProductException {
        public InsufficientStockException(String productName, int requested, int available) {
            super(String.format("Insufficient stock for product '%s'. Requested: %d, Available: %d", 
                    productName, requested, available));
        }
    }
    
    public static class InvalidProductDataException extends ProductException {
        public InvalidProductDataException(String field, String value) {
            super(String.format("Invalid product data - %s: %s", field, value));
        }
    }
}
