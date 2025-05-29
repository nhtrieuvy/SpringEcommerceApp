package com.ecommerce.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;
import java.util.HashMap;

/**
 * Global exception handler for consistent error responses across the application
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(OrderException.class)
    public ResponseEntity<Object> handleOrderException(OrderException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "message", ex.getMessage(),
                        "error", "OrderException"
                ));
    }

    @ExceptionHandler(ProductException.class)
    public ResponseEntity<Object> handleProductException(ProductException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        
        // Different status codes for different product exceptions
        if (ex instanceof ProductException.ProductNotFoundException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof ProductException.InsufficientStockException) {
            status = HttpStatus.CONFLICT;
        }
        
        return ResponseEntity
                .status(status)
                .body(Map.of(
                        "success", false,
                        "message", ex.getMessage(),
                        "error", ex.getClass().getSimpleName()
                ));
    }

    @ExceptionHandler(UserException.class)
    public ResponseEntity<Object> handleUserException(UserException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        
        // Different status codes for different user exceptions
        if (ex instanceof UserException.UserNotFoundException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof UserException.InvalidCredentialsException) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (ex instanceof UserException.UnauthorizedAccessException) {
            status = HttpStatus.FORBIDDEN;
        } else if (ex instanceof UserException.DuplicateUserException) {
            status = HttpStatus.CONFLICT;
        }
        
        return ResponseEntity
                .status(status)
                .body(Map.of(
                        "success", false,
                        "message", ex.getMessage(),
                        "error", ex.getClass().getSimpleName()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "message", "Validation failed",
                        "errors", errors,
                        "error", "ValidationException"
                ));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> handleIllegalStateException(IllegalStateException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "message", ex.getMessage(),
                        "error", "IllegalStateException"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "message", "An unexpected error occurred",
                        "error", ex.getClass().getSimpleName(),
                        "details", ex.getMessage()
                ));
    }
}
