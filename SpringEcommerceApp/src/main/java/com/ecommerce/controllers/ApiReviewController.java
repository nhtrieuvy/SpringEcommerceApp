package com.ecommerce.controllers;


import com.ecommerce.pojo.ReviewProduct;
import com.ecommerce.pojo.ReviewReply;
import com.ecommerce.pojo.ReviewStore;
import com.ecommerce.services.ReviewProductService;
import com.ecommerce.services.ReviewReplyService;
import com.ecommerce.services.ReviewStoreService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/review")
public class ApiReviewController {

    @Autowired
    private ReviewProductService reviewProductService;

    @Autowired
    private ReviewStoreService reviewStoreService;

    @Autowired
    private ReviewReplyService reviewReplyService;

    @PostMapping("/product")
    public ResponseEntity<?> addProductReview(@RequestBody ReviewProduct review) {
        reviewProductService.addReview(review);
        return ResponseEntity.ok("Đã thêm đánh giá sản phẩm");
    }

    @PostMapping("/store")
    public ResponseEntity<?> addStoreReview(@RequestBody ReviewStore review) {
        reviewStoreService.addReview(review);
        return ResponseEntity.ok("Đã thêm đánh giá cửa hàng");
    }

    @PostMapping("/reply")
    public ResponseEntity<?> replyToReview(@RequestBody ReviewReply reply) {
        reviewReplyService.addReply(reply);
        return ResponseEntity.ok("Đã phản hồi bình luận");
    }

    @GetMapping("/product/{productId}")
    public List<ReviewProduct> getProductReviews(@PathVariable Long productId) {
        return reviewProductService.getReviewsByProductId(productId);
    }

    @GetMapping("/store/{storeId}")
    public List<ReviewStore> getStoreReviews(@PathVariable Long storeId) {
        return reviewStoreService.getReviewsByStoreId(storeId);
    }

    @GetMapping("/reply/{reviewId}")
    public List<ReviewReply> getReplies(@PathVariable Long reviewId) {
        return reviewReplyService.getRepliesByReviewId(reviewId);
    }
}
