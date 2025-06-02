package com.ecommerce.services.impl;

import com.ecommerce.pojo.ReviewReply;
import com.ecommerce.repositories.ReviewReplyRepository;
import com.ecommerce.services.ReviewReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Transactional

public class ReviewReplyServiceImpl implements ReviewReplyService {

    @Autowired
    private ReviewReplyRepository replyRepo;

    
    private final Map<Long, ReviewReply> replies = new ConcurrentHashMap<>();
    private final Map<Long, List<ReviewReply>> repliesByReviewId = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);    @Override
    public ReviewReply addReply(ReviewReply reply) {
        if (reply.getCreatedAt() == null) {
            reply.setCreatedAt(new Date());
        }
        
        try {
            System.out.println("Attempting to save reply to database: " + reply);
            replyRepo.addReply(reply);
            System.out.println("Reply successfully saved to database with ID: " + reply.getId());
            
            replies.put(reply.getId(), reply);
            
            repliesByReviewId.computeIfAbsent(reply.getReviewId(), k -> new ArrayList<>())
                            .add(reply);
                            
        } catch (Exception e) {
            System.err.println("ERROR saving reply to database: " + e.getMessage());
            e.printStackTrace();
            
            if (reply.getId() == null) {
                reply.setId(idCounter.getAndIncrement());
                
                replies.put(reply.getId(), reply);
                
                repliesByReviewId.computeIfAbsent(reply.getReviewId(), k -> new ArrayList<>())
                                .add(reply);
            }
            System.err.println("Error saving reply to repository: " + e.getMessage());
        }
        
        return reply;

    }

    @Override
    public List<ReviewReply> getRepliesByReviewId(Long reviewId) {

        try {
            List<ReviewReply> dbReplies = replyRepo.getRepliesByReviewId(reviewId);
            if (dbReplies != null && !dbReplies.isEmpty()) {
                return dbReplies;
            }
        } catch (Exception e) {
            System.err.println("Error getting replies from repository: " + e.getMessage());
        }
        
        return repliesByReviewId.getOrDefault(reviewId, new ArrayList<>());
    }
      @Override
    public boolean deleteReply(Long replyId) {
        ReviewReply reply = replies.remove(replyId);
        if (reply != null && repliesByReviewId.containsKey(reply.getReviewId())) {
            repliesByReviewId.get(reply.getReviewId()).removeIf(r -> r.getId().equals(replyId));
            
            try {
                replyRepo.deleteReply(replyId);
            } catch (Exception e) {
                System.err.println("Error deleting reply from repository: " + e.getMessage());
            }
            
            return true;
        }
        return false;

    }
}
