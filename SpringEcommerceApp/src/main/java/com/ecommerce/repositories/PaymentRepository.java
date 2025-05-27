package com.ecommerce.repositories;

import com.ecommerce.pojo.Payment;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository {
    void save(Payment payment);
    void update(Payment payment);
    void delete(Long id);
    Payment findById(Long id);
    List<Payment> findAll();
    Payment findByOrderId(Long orderId);
    Payment findByTransactionId(String transactionId);
}