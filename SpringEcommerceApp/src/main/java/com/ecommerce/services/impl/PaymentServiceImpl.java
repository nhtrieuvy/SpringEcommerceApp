package com.ecommerce.services.impl;

import com.ecommerce.pojo.Payment;
import com.ecommerce.repositories.PaymentRepository;
import com.ecommerce.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public void save(Payment payment) {
        paymentRepository.save(payment);
    }

    @Override
    public void update(Payment payment) {
        paymentRepository.update(payment);
    }

    @Override
    public void delete(Long id) {
        // Implement delete logic if needed
    }

    @Override
    public Payment findById(Long id) {
        return paymentRepository.findById(id);
    }

    @Override
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment findByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
}