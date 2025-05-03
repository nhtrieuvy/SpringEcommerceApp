package com.ecommerce.repositories;

import com.ecommerce.pojo.OrderDetail;
import java.util.List;

public interface OrderDetailRepository {
    void save(OrderDetail orderDetail);
    void update(OrderDetail orderDetail);
    void delete(Long id);
    OrderDetail findById(Long id);
    List<OrderDetail> findAll();
    List<OrderDetail> findByOrderId(Long orderId);
}