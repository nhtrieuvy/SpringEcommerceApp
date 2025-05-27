package com.ecommerce.services.impl;

import com.ecommerce.dtos.PaymentRequestDTO;
import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.Payment;
import com.ecommerce.pojo.PaymentMethod;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.repositories.PaymentRepository;
import com.ecommerce.services.PaymentService;
import com.ecommerce.services.MoMoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Import PayPal SDK classes
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private MoMoService moMoService;

    @Autowired
    private APIContext apiContext; // Inject APIContext

    @Override
    public Payment save(Payment payment) {
        paymentRepository.save(payment);
        return payment;
    }

    @Override
    public Payment update(Payment payment) {
        if (payment.getId() == null) {
            throw new RuntimeException("Payment ID cannot be null for update.");
        }

        Payment existingPayment = paymentRepository.findById(payment.getId());
        if (existingPayment == null) {
            throw new RuntimeException("Payment not found with ID: " + payment.getId() + " for update.");
        }

        paymentRepository.update(payment);
        return payment;
    }

    @Override
    public void delete(Long id) {
        Payment existingPayment = paymentRepository.findById(id);
        if (existingPayment == null) {
            throw new RuntimeException("Payment not found with ID: " + id + " for deletion.");
        }
        paymentRepository.delete(id);
    }

    @Override
    public Payment findById(Long id) {
        Payment payment = paymentRepository.findById(id);
        if (payment == null) {
            throw new RuntimeException("Payment not found with ID: " + id);
        }
        return payment;
    }

    @Override
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    @Override
    public PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequestDTO) {
        Order order = orderRepository.findById(paymentRequestDTO.getOrderId());
        if (order == null) {
            throw new RuntimeException("Order not found with ID: " + paymentRequestDTO.getOrderId());
        }
        System.out.println("Processing payment for order ID: " + order.getId() + " with method: " + paymentRequestDTO.getPaymentMethod());

        Payment payment = paymentRepository.findByOrderId(order.getId());
        boolean isNewPaymentRecord;

        if (payment != null) { // Existing payment record for this order
            if ("COMPLETED".equals(payment.getStatus())) {
                System.out.println("Payment for order ID: " + order.getId() + " already completed.");
                return new PaymentResponseDTO(
                        payment.getId(),
                        order.getId(),
                        payment.getPaymentMethod(),
                        payment.getAmount(),
                        payment.getStatus(),
                        payment.getTransactionId(),
                        payment.getPaymentDate(),
                        "Payment already completed for this order.");
            }
            // Reusing existing payment record.
            isNewPaymentRecord = false;
            System.out.println("Reusing existing payment record (ID: " + payment.getId() + ") for order ID: " + order.getId() +
                               ". Current method: " + payment.getPaymentMethod() + ", status: " + payment.getStatus() +
                               ". Requested method: " + paymentRequestDTO.getPaymentMethod());
            // paymentDate is not changed for existing records.
        } else { // No payment record for this order, create a new one.
            payment = new Payment();
            payment.setOrder(order); // Link to order
            payment.setPaymentDate(new Date()); // Set creation date for the new payment record
            isNewPaymentRecord = true;
            System.out.println("Creating new payment record for order ID: " + order.getId());
        }

        // Set/update common properties.
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(paymentRequestDTO.getPaymentMethod()); // Set/Update to the requested method

        try {
            switch (paymentRequestDTO.getPaymentMethod()) {
                case CASH_ON_DELIVERY:
                    payment.setStatus("PENDING_CONFIRMATION");
                    payment.setTransactionId(null);
                    order.setStatus("PROCESSING_COD");

                    if (isNewPaymentRecord) {
                        paymentRepository.save(payment);
                    } else {
                        paymentRepository.update(payment);
                    }
                    orderRepository.update(order);

                    return new PaymentResponseDTO(
                            payment.getId(),
                            order.getId(),
                            payment.getPaymentMethod(),
                            payment.getAmount(),
                            payment.getStatus(),
                            payment.getTransactionId(),
                            payment.getPaymentDate(),
                            "Cash on Delivery order placed successfully.");

                case PAYPAL:
                    com.paypal.api.payments.Payment paypalPayment = createPaypalPaymentObject(order,
                            paymentRequestDTO.getCancelUrl(), paymentRequestDTO.getSuccessUrl());
                    com.paypal.api.payments.Payment createdPayment = paypalPayment.create(apiContext);
                    System.out.println("PayPal Payment created with ID: " + createdPayment.getId());

                    payment.setStatus("PENDING_PAYPAL");
                    payment.setTransactionId(createdPayment.getId());
                    order.setStatus("AWAITING_PAYPAL_PAYMENT");

                    if (isNewPaymentRecord) {
                        paymentRepository.save(payment);
                        System.out.println("Saved new payment record with ID: " + payment.getId() + " for PayPal.");
                    } else {
                        paymentRepository.update(payment);
                        System.out.println("Updated existing payment record with ID: " + payment.getId() + " for PayPal.");
                    }
                    orderRepository.update(order);

                    String approvalUrl = null;
                    for (Links link : createdPayment.getLinks()) {
                        if (link.getRel().equalsIgnoreCase("approval_url")) {
                            approvalUrl = link.getHref();
                            break;
                        }
                    }
                    if (approvalUrl == null) {
                        throw new RuntimeException("PayPal approval URL not found.");
                    }

                    PaymentResponseDTO response = new PaymentResponseDTO(
                            payment.getId(),
                            order.getId(),
                            payment.getPaymentMethod(),
                            payment.getAmount(),
                            payment.getStatus(),
                            payment.getTransactionId(),
                            payment.getPaymentDate(),
                            "Redirecting to PayPal for payment.");
                    response.setRedirectUrl(approvalUrl);
                    return response;

                case MOMO:
                    // Assuming MoMoServiceImpl.createMoMoPayment uses MomoConfig for URLs if not passed directly.
                    // The current signature in summary is createMoMoPayment(Order order).
                    PaymentResponseDTO momoExtResponse = moMoService.createMoMoPayment(order);

                    payment.setStatus("PENDING_MOMO");
                    payment.setTransactionId(momoExtResponse.getTransactionId());
                    order.setStatus("AWAITING_MOMO_PAYMENT");

                    if (isNewPaymentRecord) {
                        paymentRepository.save(payment);
                        System.out.println("Saved new payment record with ID: " + payment.getId() + " for MoMo.");
                    } else {
                        paymentRepository.update(payment);
                        System.out.println("Updated existing payment record with ID: " + payment.getId() + " for MoMo.");
                    }
                    orderRepository.update(order);

                    PaymentResponseDTO momoResponseDTO = new PaymentResponseDTO(
                            payment.getId(),
                            order.getId(),
                            payment.getPaymentMethod(),
                            payment.getAmount(),
                            payment.getStatus(),
                            payment.getTransactionId(),
                            payment.getPaymentDate(),
                            momoExtResponse.getMessage());
                    momoResponseDTO.setRedirectUrl(momoExtResponse.getRedirectUrl());
                    return momoResponseDTO;

                case ZALO_PAY:
                    // Example: update or save logic would be similar
                    payment.setStatus("PENDING_ZALOPAY");
                    payment.setTransactionId("MOCK_ZALOPAY_" + UUID.randomUUID().toString());
                    order.setStatus("AWAITING_ZALOPAY_PAYMENT");
                    if (isNewPaymentRecord) {
                        paymentRepository.save(payment);
                    } else {
                        paymentRepository.update(payment);
                    }
                    orderRepository.update(order);
                    // ... return ZaloPay response ...
                    // For now, returning a generic message as the original code didn't fully implement it
                    return new PaymentResponseDTO(
                            payment.getId(), order.getId(), payment.getPaymentMethod(), payment.getAmount(),
                            payment.getStatus(), payment.getTransactionId(), payment.getPaymentDate(),
                            "ZaloPay payment initiated (mock).");


                default:
                    throw new IllegalArgumentException(
                            "Unsupported payment method: " + paymentRequestDTO.getPaymentMethod());
            }

        } catch (PayPalRESTException e) {
            System.err.println("PayPal payment processing failed: " + e.getMessage());
            payment.setStatus("FAILED");
            order.setStatus("PAYMENT_FAILED");

            if (payment.getOrder() != null) { // Ensure payment object is minimally valid
                if (payment.getId() != null) {
                    paymentRepository.update(payment);
                } else if (isNewPaymentRecord) { // Only save if it was intended to be new
                    paymentRepository.save(payment);
                }
            }
            orderRepository.update(order);

            return new PaymentResponseDTO(
                    payment.getId(), // May be null if save failed or wasn't called
                    order.getId(),
                    paymentRequestDTO.getPaymentMethod(),
                    order.getTotalAmount(),
                    "FAILED",
                    payment.getTransactionId(), // May be null
                    payment.getPaymentDate(), // May be null if new and not set
                    "PayPal payment processing failed: " + e.getDetails());
        } catch (Exception e) {
            System.err.println("Payment processing failed for method " + paymentRequestDTO.getPaymentMethod() + ": " + e.getMessage());
            e.printStackTrace();

            payment.setStatus("FAILED");
            order.setStatus("PAYMENT_FAILED");

            if (payment.getOrder() != null) { // Ensure payment object is minimally valid
                 // If it's a new record that failed before the first save, save it as FAILED.
                 // If it's an existing record, update it to FAILED.
                if (isNewPaymentRecord) {
                    paymentRepository.save(payment);
                } else if (payment.getId() != null) { // Ensure existing record has an ID
                    paymentRepository.update(payment);
                }
            }
            orderRepository.update(order);

            return new PaymentResponseDTO(
                    payment.getId(),
                    order.getId(),
                    paymentRequestDTO.getPaymentMethod(),
                    order.getTotalAmount(),
                    "FAILED",
                    null, // Transaction ID might not be available or relevant for a general failure
                    new Date(), // Use current date for the failure response
                    "Payment processing failed: " + e.getMessage());
        }
    }

    private com.paypal.api.payments.Payment createPaypalPaymentObject(Order order, String cancelUrl, String successUrl)
            throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setCurrency("USD"); // Or get from order/config
        // Format to 2 decimal places for PayPal
        String totalAmountStr = BigDecimal.valueOf(order.getTotalAmount()).setScale(2, RoundingMode.HALF_UP).toString();
        amount.setTotal(totalAmountStr);

        Transaction transaction = new Transaction();
        transaction.setDescription("Payment for order " + order.getId());
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        com.paypal.api.payments.Payment payment = new com.paypal.api.payments.Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        // Make sure these URLs are correctly configured and reachable
        redirectUrls.setCancelUrl(cancelUrl); // e.g., http://localhost:8080/payments/paypal/cancel
        redirectUrls.setReturnUrl(successUrl); // e.g., http://localhost:8080/payments/paypal/success

        payment.setRedirectUrls(redirectUrls);
        return payment;
    }

    @Override
    public PaymentResponseDTO executePaypalPayment(String paymentId, String payerId) {
        System.out.println("=== BẮT ĐẦU THỰC HIỆN PAYPAL PAYMENT ===");
        System.out.println("PayPal Payment ID: " + paymentId);
        System.out.println("PayPal Payer ID: " + payerId);

        Payment paymentRecord = paymentRepository.findByTransactionId(paymentId);

        // Nếu không tìm thấy payment record, trả về lỗi thay vì tạo mới
        if (paymentRecord == null) {
            System.err.println("❌ Không tìm thấy payment record cho PayPal ID: " + paymentId);
            System.err.println("⚠️ Frontend cần gọi /api/payments/process trước khi execute PayPal payment");

            throw new RuntimeException("Payment record not found for PayPal paymentId: " + paymentId +
                    ". Please initiate payment through /api/payments/process first.");
        } else {
            System.out.println("✅ Tìm thấy payment record với ID: " + paymentRecord.getId());
        }

        Order order = paymentRecord.getOrder();

        com.paypal.api.payments.Payment payment = new com.paypal.api.payments.Payment();
        payment.setId(paymentId); // The PayPal Payment ID

        PaymentExecution paymentExecute = new PaymentExecution();
        paymentExecute.setPayerId(payerId); // The PayerID from PayPal callback

        try {
            System.out.println("🔄 Đang thực hiện PayPal payment execution...");
            com.paypal.api.payments.Payment executedPayment = payment.execute(apiContext, paymentExecute);
            System.out.println("✅ PayPal payment executed, status: " + executedPayment.getState());

            if (executedPayment.getState().equalsIgnoreCase("approved")) {
                System.out.println("✅ PayPal payment được approve, đang cập nhật payment record...");
                paymentRecord.setStatus("COMPLETED");
                paymentRecord.setPaypalPayerId(payerId);
                // Capture ID might be part of transactions -> related_resources -> sale -> id
                if (!executedPayment.getTransactions().isEmpty() &&
                        !executedPayment.getTransactions().get(0).getRelatedResources().isEmpty() &&
                        executedPayment.getTransactions().get(0).getRelatedResources().get(0).getSale() != null) {
                    paymentRecord.setPaypalCaptureId(
                            executedPayment.getTransactions().get(0).getRelatedResources().get(0).getSale().getId());
                }
                paymentRecord.setPaymentDate(new Date()); // Update payment date to completion time
                order.setStatus("PROCESSING"); // Or "COMPLETED" depending on your flow

                paymentRepository.update(paymentRecord);
                orderRepository.update(order);

                System.out.println("✅ Payment và Order đã được cập nhật thành công!");
                System.out.println("=== KẾT THÚC PAYPAL PAYMENT EXECUTION ===");

                return new PaymentResponseDTO(
                        paymentRecord.getId(),
                        order.getId(),
                        paymentRecord.getPaymentMethod(),
                        paymentRecord.getAmount(),
                        paymentRecord.getStatus(),
                        paymentRecord.getTransactionId(),
                        paymentRecord.getPaymentDate(),
                        "PayPal payment completed successfully.");
            } else {
                // Handle other states like pending, failed, etc.
                paymentRecord.setStatus("FAILED");
                paymentRecord.setPaypalPayerId(payerId); // Still useful to store
                order.setStatus("PAYMENT_FAILED");
                paymentRepository.update(paymentRecord);
                orderRepository.update(order);
                return new PaymentResponseDTO(
                        paymentRecord.getId(),
                        order.getId(),
                        paymentRecord.getPaymentMethod(),
                        paymentRecord.getAmount(),
                        paymentRecord.getStatus(),
                        paymentRecord.getTransactionId(),
                        paymentRecord.getPaymentDate(),
                        "PayPal payment failed. Status: " + executedPayment.getState());
            }
        } catch (PayPalRESTException e) {
            System.err.println("PayPal execution failed: " + e.getMessage());
            // Log detailed error: e.getDetails()
            paymentRecord.setStatus("FAILED");
            order.setStatus("PAYMENT_FAILED");
            if (paymentRecord.getId() != null) { // Ensure it's an existing record before updating
                paymentRepository.update(paymentRecord);
            }
            orderRepository.update(order);
            throw new RuntimeException("PayPal payment execution failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
}