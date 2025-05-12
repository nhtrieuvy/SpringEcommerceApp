package com.ecommerce.repositories;

import com.ecommerce.pojo.ReviewReply;
import java.util.List;

public interface ReviewReplyRepository {
    void addReply(ReviewReply reply);
    List<ReviewReply> getRepliesByReviewId(Long reviewId);
}
