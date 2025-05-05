package com.ecommerce.services.impl;

import com.ecommerce.pojo.OrderDetail;
import com.ecommerce.repositories.OrderDetailRepository;
import com.ecommerce.services.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OrderDetailServiceImpl implements OrderDetailService {
    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Override
    public void save(OrderDetail orderDetail) {
        orderDetailRepository.save(orderDetail);
    }

    @Override
    public void update(OrderDetail orderDetail) {
        orderDetailRepository.update(orderDetail);
    }

    @Override
    public void delete(Long id) {
        orderDetailRepository.delete(id);
    }

    @Override
    public OrderDetail findById(Long id) {
        return orderDetailRepository.findById(id);
    }

    @Override
    public List<OrderDetail> findAll() {
        return orderDetailRepository.findAll();
    }

    @Override
    public List<OrderDetail> findByOrderId(Long orderId) {
        return orderDetailRepository.findByOrderId(orderId);
    }
}