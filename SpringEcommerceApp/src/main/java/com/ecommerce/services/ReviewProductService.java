package com.ecommerce.services;

import com.ecommerce.pojo.ReviewProduct;
import java.util.List;

public interface ReviewProductService {

    /**
     * Thêm đánh giá cho sản phẩm
     * @param review Thông tin đánh giá
     * @return Đánh giá đã được thêm
     */
    ReviewProduct addReview(ReviewProduct review);
    
    /**
     * Cập nhật đánh giá
     * @param review Thông tin đánh giá cần cập nhật
     * @return Đánh giá đã được cập nhật
     */
    ReviewProduct updateReview(ReviewProduct review);
    
    /**
     * Xoá đánh giá
     * @param reviewId ID của đánh giá cần xoá
     * @return true nếu xoá thành công, false nếu thất bại
     */
    boolean deleteReview(Long reviewId);
    
    /**
     * Lấy đánh giá theo ID
     * @param reviewId ID của đánh giá
     * @return Đánh giá
     */
    ReviewProduct getReviewById(Long reviewId);
    
    /**
     * Lấy danh sách đánh giá của một sản phẩm
     * @param productId ID của sản phẩm
     * @return Danh sách đánh giá
     */
    List<ReviewProduct> getReviewsByProductId(Long productId);
    
    /**
     * Lấy điểm đánh giá trung bình của một sản phẩm
     * @param productId ID của sản phẩm
     * @return Điểm đánh giá trung bình
     */
    double getAverageRatingByProductId(Long productId);

}
