package com.ecommerce.services;

import com.ecommerce.pojo.ReviewReply;
import java.util.List;

public interface ReviewReplyService {
    void addReply(ReviewReply reply);
    List<ReviewReply> getRepliesByReviewId(Long reviewId);
}
