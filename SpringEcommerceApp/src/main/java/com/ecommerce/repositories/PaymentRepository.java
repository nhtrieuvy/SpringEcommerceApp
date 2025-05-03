package com.ecommerce.repositories;

import com.ecommerce.pojo.Payment;
import java.util.List;

public interface PaymentRepository {
    void save(Payment payment);
    void update(Payment payment);
    void delete(Long id);
    Payment findById(Long id);
    List<Payment> findAll();
    Payment findByOrderId(Long orderId);
}