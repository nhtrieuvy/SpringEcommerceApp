package com.ecommerce.repositories;

import com.ecommerce.pojo.Comment;
import java.util.List;

public interface CommentRepository {
    void save(Comment comment);
    void update(Comment comment);
    void delete(Long id);
    Comment findById(Long id);
    List<Comment> findAll();
    List<Comment> findByProductId(Long productId);
}