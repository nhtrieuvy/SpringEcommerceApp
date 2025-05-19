package com.ecommerce.services;

import com.ecommerce.pojo.ReviewReply;
import java.util.List;

public interface ReviewReplyService {
    /**
     * Thêm phản hồi cho đánh giá
     * @param reply Thông tin phản hồi
     * @return Phản hồi đã được thêm
     */
    ReviewReply addReply(ReviewReply reply);
    
    /**
     * Lấy danh sách phản hồi của một đánh giá
     * @param reviewId ID của đánh giá
     * @return Danh sách phản hồi
     */
    List<ReviewReply> getRepliesByReviewId(Long reviewId);
    
    /**
     * Xoá phản hồi
     * @param replyId ID của phản hồi cần xoá
     * @return true nếu xoá thành công, false nếu thất bại
     */
    boolean deleteReply(Long replyId);
}
