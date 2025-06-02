package com.ecommerce.services;

import com.ecommerce.pojo.ReviewReply;
import java.util.List;

public interface ReviewReplyService {

    ReviewReply addReply(ReviewReply reply);

    List<ReviewReply> getRepliesByReviewId(Long reviewId);
    

    boolean deleteReply(Long replyId);

}
