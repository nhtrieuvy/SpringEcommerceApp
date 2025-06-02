package com.ecommerce.services;

import com.ecommerce.dtos.PaymentRequestDTO;
import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Payment;
import java.util.List;

public interface PaymentService {
    Payment save(Payment payment); 
    Payment update(Payment payment); 
    void delete(Long id);
    Payment findById(Long id);
    List<Payment> findAll();
    PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequestDTO);
    Payment getPaymentByOrderId(Long orderId); 
    
   
    PaymentResponseDTO executePaypalPayment(String paymentId, String payerId);
   
    boolean updatePaymentStatus(String orderId, String status, String transactionId);
}