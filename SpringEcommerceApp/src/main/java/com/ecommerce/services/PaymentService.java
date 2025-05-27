package com.ecommerce.services;

import com.ecommerce.dtos.PaymentRequestDTO;
import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Payment;
import java.util.List;

public interface PaymentService {
    Payment save(Payment payment); // Changed to return Payment
    Payment update(Payment payment); // Changed to return Payment
    void delete(Long id);
    Payment findById(Long id);
    List<Payment> findAll();
    // Payment findByOrderId(Long orderId); // This was the duplicate causing issues, replaced by getPaymentByOrderId
    PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequestDTO);
    Payment getPaymentByOrderId(Long orderId); // Kept this one for clarity
    // Potentially methods to handle callbacks from payment gateways
    // PaymentResponseDTO handlePaypalCallback(Object paypalResponse);
    // PaymentResponseDTO handleStripeCallback(Object stripeResponse);

    /**
     * Executes a PayPal payment after the user has approved it on PayPal's site.
     * @param paymentId The PayPal payment ID.
     * @param payerId The PayPal payer ID.
     * @return A response DTO containing the final payment status.
     */
    PaymentResponseDTO executePaypalPayment(String paymentId, String payerId);
}