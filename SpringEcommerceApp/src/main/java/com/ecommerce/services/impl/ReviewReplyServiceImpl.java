package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewReply;
import com.ecommerce.repositories.ReviewReplyRepository;
import com.ecommerce.services.ReviewReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewReplyServiceImpl implements ReviewReplyService {

    @Autowired
    private ReviewReplyRepository replyRepo;

    @Override
    public void addReply(ReviewReply reply) {
        replyRepo.addReply(reply);
    }

    @Override
    public List<ReviewReply> getRepliesByReviewId(Long reviewId) {
        return replyRepo.getRepliesByReviewId(reviewId);
    }
}
