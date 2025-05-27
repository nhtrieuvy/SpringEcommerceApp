package com.ecommerce.exceptions;

/**
 * Exception for user-related business logic errors
 */
public class UserException extends RuntimeException {
    
    public UserException(String message) {
        super(message);
    }
    
    public UserException(String message, Throwable cause) {
        super(message, cause);
    }
    
    // Specific user error types
    public static class UserNotFoundException extends UserException {
        public UserNotFoundException(String identifier) {
            super("User not found: " + identifier);
        }
    }
    
    public static class DuplicateUserException extends UserException {
        public DuplicateUserException(String field, String value) {
            super(String.format("User already exists with %s: %s", field, value));
        }
    }
    
    public static class InvalidCredentialsException extends UserException {
        public InvalidCredentialsException() {
            super("Invalid username or password");
        }
    }
    
    public static class InactiveUserException extends UserException {
        public InactiveUserException(String username) {
            super("User account is inactive: " + username);
        }
    }
    
    public static class UnauthorizedAccessException extends UserException {
        public UnauthorizedAccessException(String action) {
            super("Unauthorized access to: " + action);
        }
    }
}
