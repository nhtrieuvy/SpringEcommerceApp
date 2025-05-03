package com.ecommerce.repositories;

import com.ecommerce.pojo.Order;
import java.util.List;

public interface OrderRepository {
    void save(Order order);
    void update(Order order);
    void delete(Long id);
    Order findById(Long id);
    List<Order> findAll();
    List<Order> findByUserId(Long userId);
}