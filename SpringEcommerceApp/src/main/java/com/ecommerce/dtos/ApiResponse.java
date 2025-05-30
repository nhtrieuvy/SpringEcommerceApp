// package com.ecommerce.dtos;

// import com.fasterxml.jackson.annotation.JsonInclude;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// import java.time.LocalDateTime;
// import java.util.Map;

// /**
//  * Standardized API response format for consistent client-server communication
//  */
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// @JsonInclude(JsonInclude.Include.NON_NULL)
// public class ApiResponse<T> {
    
//     @Builder.Default
//     private boolean success = true;
    
//     private String message;
    
//     private T data;
    
//     private Map<String, Object> metadata;
    
//     @Builder.Default
//     private LocalDateTime timestamp = LocalDateTime.now();
    
//     private String error;
    
//     private String path;
    
//     // Success response factory methods
//     public static <T> ApiResponse<T> success(T data) {
//         return ApiResponse.<T>builder()
//                 .success(true)
//                 .data(data)
//                 .build();
//     }
    
//     public static <T> ApiResponse<T> success(T data, String message) {
//         return ApiResponse.<T>builder()
//                 .success(true)
//                 .data(data)
//                 .message(message)
//                 .build();
//     }
    
//     public static <T> ApiResponse<T> success(T data, String message, Map<String, Object> metadata) {
//         return ApiResponse.<T>builder()
//                 .success(true)
//                 .data(data)
//                 .message(message)
//                 .metadata(metadata)
//                 .build();
//     }
    
//     // Error response factory methods
//     public static <T> ApiResponse<T> error(String message) {
//         return ApiResponse.<T>builder()
//                 .success(false)
//                 .message(message)
//                 .build();
//     }
    
//     public static <T> ApiResponse<T> error(String message, String error) {
//         return ApiResponse.<T>builder()
//                 .success(false)
//                 .message(message)
//                 .error(error)
//                 .build();
//     }
    
//     public static <T> ApiResponse<T> error(String message, String error, String path) {
//         return ApiResponse.<T>builder()
//                 .success(false)
//                 .message(message)
//                 .error(error)
//                 .path(path)
//                 .build();
//     }
// }
