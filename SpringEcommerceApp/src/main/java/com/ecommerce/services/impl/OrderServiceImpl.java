package com.ecommerce.services.impl;

import com.ecommerce.pojo.Order;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Override
    public void save(Order order) {
        orderRepository.save(order);
    }

    @Override
    public void update(Order order) {
        orderRepository.update(order);
    }

    @Override
    public void delete(Long id) {
        orderRepository.delete(id);
    }

    @Override
    public Order findById(Long id) {
        return orderRepository.findById(id);
    }

    @Override
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> findByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}