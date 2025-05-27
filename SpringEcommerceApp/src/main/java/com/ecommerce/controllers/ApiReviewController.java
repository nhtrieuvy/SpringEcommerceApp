package com.ecommerce.controllers;


import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.pojo.ReviewReply;

import com.ecommerce.services.ReviewProductService;
import com.ecommerce.services.ReviewReplyService;
import com.ecommerce.services.UserService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/review")
public class ApiReviewController {
    @Autowired
    private ReviewProductService reviewProductService;

    @Autowired
    private ReviewReplyService reviewReplyService;

    @Autowired
    private UserService userService;// API cho đánh giá sản phẩm



    @PostMapping("/product")
    public ResponseEntity<?> addProductReview(@RequestBody ReviewProduct review) {
        try {
            // Lấy user hiện tại từ security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để đánh giá sản phẩm"));
            }

            // Lấy thông tin người dùng từ authentication
            String username = authentication.getName();
            System.out.println("Current authenticated user: " + username);
            // Lấy userId từ principal object
            Object principal = authentication.getPrincipal();
            Long userId = null;

            // Kiểm tra nếu principal là UserPrincipal
            if (principal instanceof com.ecommerce.security.UserPrincipal) {
                userId = ((com.ecommerce.security.UserPrincipal) principal).getUser().getId();
                System.out.println("Found UserPrincipal with userId: " + userId);
            }
            // Kiểm tra nếu principal là User custom của chúng ta
            else if (principal instanceof com.ecommerce.pojo.User) {
                userId = ((com.ecommerce.pojo.User) principal).getId();
                System.out.println("Found User with userId: " + userId);
            }
            // Dùng userId được gửi lên từ client nếu có
            else if (review.getUserId() != null) {
                userId = review.getUserId();
                System.out.println("Using provided userId from request: " + userId);
            }
            // Log cho debugging
            else {
                System.out.println("Principal type: " + (principal != null ? principal.getClass().getName() : "null"));
                System.out.println("Authentication details: " + authentication);
                // Giữ lại userId từ request nếu có
                if (review.getUserId() != null) {
                    userId = review.getUserId();
                    System.out.println("Using provided userId: " + userId);
                } else {
                    System.out.println("Warning: Could not extract userId from authentication and no userId provided");
                }
            }

            // Đặt userId cho review nếu tìm được
            if (userId != null) {
                review.setUserId(userId);
                System.out.println("Setting review userId to: " + userId);
            }

            ReviewProduct savedReview = reviewProductService.addReview(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }

    }

    @PutMapping("/product/{id}")
    public ResponseEntity<?> updateProductReview(@PathVariable Long id, @RequestBody ReviewProduct review) {
        try {
            review.setId(id);
            ReviewProduct updatedReview = reviewProductService.updateReview(review);
            if (updatedReview == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<?> deleteProductReview(@PathVariable Long id) {
        try {
            boolean deleted = reviewProductService.deleteReview(id);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("message", "Đã xóa đánh giá sản phẩm thành công"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    // API cho trả lời đánh giá
    @PostMapping("/reply")
    public ResponseEntity<?> replyToReview(@RequestBody ReviewReply reply) {
        try {
            // Lấy user hiện tại từ security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để trả lời đánh giá"));
            }

            // Lấy thông tin người dùng từ authentication
            String username = authentication.getName();
            System.out.println("Current authenticated user for reply: " + username);

            // Lấy userId từ principal object
            Object principal = authentication.getPrincipal();
            Long userId = null;

            // Kiểm tra nếu principal là UserPrincipal
            if (principal instanceof com.ecommerce.security.UserPrincipal) {
                userId = ((com.ecommerce.security.UserPrincipal) principal).getUser().getId();
                System.out.println("Found UserPrincipal with userId: " + userId);
            }
            // Kiểm tra nếu principal là User custom của chúng ta
            else if (principal instanceof com.ecommerce.pojo.User) {
                userId = ((com.ecommerce.pojo.User) principal).getId();
                System.out.println("Found User with userId: " + userId);
            }
            // Dùng userId được gửi lên từ client nếu có
            else if (reply.getUserId() != null) {
                userId = reply.getUserId();
                System.out.println("Using provided userId from request: " + userId);
            }
            // Log cho debugging
            else {
                System.out.println("Principal type: " + (principal != null ? principal.getClass().getName() : "null"));
                System.out.println("Authentication details: " + authentication);
            }

            // Đặt userId cho reply
            if (userId != null) {
                reply.setUserId(userId);
                System.out.println("Setting reply userId to: " + userId);
            } else if (reply.getUserId() == null) {
                // Fallback để đảm bảo có userId
                System.out.println("Warning: Could not extract userId, using default");
                reply.setUserId(1L);
            }

            ReviewReply savedReply = reviewReplyService.addReply(reply);
            return ResponseEntity.ok(savedReply);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        try {
            List<ReviewProduct> reviews = reviewProductService.getReviewsByProductId(productId);
            double averageRating = reviewProductService.getAverageRatingByProductId(productId);

            // Thêm thông tin cơ bản của user vào mỗi review để hiển thị trên frontend
            List<Map<String, Object>> enhancedReviews = new ArrayList<>();

            for (ReviewProduct review : reviews) {
                // Tạo bản sao của review với thông tin user
                Map<String, Object> enhancedReview = new HashMap<>();

                // Thêm tất cả thuộc tính của review
                enhancedReview.put("id", review.getId());
                enhancedReview.put("userId", review.getUserId());
                enhancedReview.put("productId", review.getProductId());
                enhancedReview.put("rating", review.getRating());
                enhancedReview.put("comment", review.getComment());
                enhancedReview.put("createdAt", review.getCreatedAt());

                // Thử lấy dữ liệu user từ database
                try {
                    if (review.getUserId() != null) {
                        com.ecommerce.pojo.User user = userService.findById(review.getUserId());
                        if (user != null) {
                            // Tạo đối tượng user rút gọn để bảo mật
                            Map<String, Object> userObj = new HashMap<>();
                            userObj.put("id", user.getId());
                            userObj.put("username", user.getUsername());
                            userObj.put("fullName", user.getFullname());
                            userObj.put("avatar", user.getAvatar());


                            enhancedReview.put("user", userObj);
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Cannot load user data for review #" + review.getId() + ": " + ex.getMessage());
                    // Continue without user data, frontend will handle it
                }

                enhancedReviews.add(enhancedReview);
            }

            // Return enhanced review data and summary information
            Map<String, Object> response = new HashMap<>();
            response.put("reviews", enhancedReviews);
            response.put("averageRating", averageRating);
            response.put("count", reviews.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reply/{reviewId}")
    public ResponseEntity<?> getReplies(@PathVariable Long reviewId) {
        try {
            List<ReviewReply> replies = reviewReplyService.getRepliesByReviewId(reviewId);

            // Thêm thông tin cơ bản của user vào mỗi reply để hiển thị trên frontend
            List<Map<String, Object>> enhancedReplies = new ArrayList<>();

            for (ReviewReply reply : replies) {
                // Tạo bản sao của reply với thông tin user
                Map<String, Object> enhancedReply = new HashMap<>();

                // Thêm tất cả thuộc tính của reply
                enhancedReply.put("id", reply.getId());
                enhancedReply.put("reviewId", reply.getReviewId());
                enhancedReply.put("userId", reply.getUserId());
                enhancedReply.put("comment", reply.getComment());
                enhancedReply.put("createdAt", reply.getCreatedAt());

                // Thử lấy dữ liệu user từ database
                try {
                    if (reply.getUserId() != null) {
                        com.ecommerce.pojo.User user = userService.findById(reply.getUserId());
                        if (user != null) {
                            // Tạo đối tượng user rút gọn để bảo mật
                            Map<String, Object> userObj = new HashMap<>();
                            userObj.put("id", user.getId());
                            userObj.put("username", user.getUsername());
                            userObj.put("fullName", user.getFullname());
                            userObj.put("avatar", user.getAvatar());

                            // Kiểm tra nếu user là seller
                            boolean isSeller = user.getRoles() != null &&
                                    user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SELLER"));
                            enhancedReply.put("isFromSeller", isSeller);

                            enhancedReply.put("user", userObj);
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Cannot load user data for reply #" + reply.getId() + ": " + ex.getMessage());
                    // Continue without user data, frontend will handle it
                }

                enhancedReplies.add(enhancedReply);
            }

            return ResponseEntity.ok(enhancedReplies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/reply/{id}")
    public ResponseEntity<?> deleteReply(@PathVariable Long id) {
        try {
            boolean deleted = reviewReplyService.deleteReply(id);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("message", "Đã xóa phản hồi thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }

    }
}
