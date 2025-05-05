package com.ecommerce.services.impl;

import com.ecommerce.pojo.Comment;
import com.ecommerce.repositories.CommentRepository;
import com.ecommerce.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Override
    public void save(Comment comment) {
        commentRepository.save(comment);
    }

    @Override
    public void update(Comment comment) {
        commentRepository.update(comment);
    }

    @Override
    public void delete(Long id) {
        commentRepository.delete(id);
    }

    @Override
    public Comment findById(Long id) {
        return commentRepository.findById(id);
    }

    @Override
    public List<Comment> findAll() {
        return commentRepository.findAll();
    }

    @Override
    public List<Comment> findByProductId(Long productId) {
        return commentRepository.findByProductId(productId);
    }
}