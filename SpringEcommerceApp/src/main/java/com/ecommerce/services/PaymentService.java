package com.ecommerce.services;

import com.ecommerce.pojo.Payment;
import java.util.List;

public interface PaymentService {
    void save(Payment payment);
    void update(Payment payment);
    void delete(Long id);
    Payment findById(Long id);
    List<Payment> findAll();
    Payment findByOrderId(Long orderId);
}