package com.ecommerce.services.impl;

import com.ecommerce.dtos.PaymentRequestDTO;
import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.Payment;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.repositories.PaymentRepository;
import com.ecommerce.services.PaymentService;
import com.ecommerce.services.MoMoService;
import com.ecommerce.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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
    private OrderService orderService;

    @Autowired
    private APIContext apiContext;

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
        System.out.println("Processing payment for order ID: " + order.getId() + " with method: "
                + paymentRequestDTO.getPaymentMethod());

        Payment payment = paymentRepository.findByOrderId(order.getId());
        boolean isNewPaymentRecord;

        if (payment != null) {
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
            isNewPaymentRecord = false;
            System.out.println(
                    "Reusing existing payment record (ID: " + payment.getId() + ") for order ID: " + order.getId() +
                            ". Current method: " + payment.getPaymentMethod() + ", status: " + payment.getStatus() +
                            ". Requested method: " + paymentRequestDTO.getPaymentMethod());

        } else {
            payment = new Payment();
            payment.setOrder(order);
            payment.setPaymentDate(new Date());
            isNewPaymentRecord = true;
            System.out.println("Creating new payment record for order ID: " + order.getId());
        }

        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(paymentRequestDTO.getPaymentMethod());

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
                        System.out.println(
                                "Updated existing payment record with ID: " + payment.getId() + " for PayPal.");
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

                    PaymentResponseDTO momoExtResponse = moMoService.createMoMoPayment(order);

                    payment.setStatus("PENDING_MOMO");
                    payment.setTransactionId(momoExtResponse.getTransactionId());
                    order.setStatus("AWAITING_MOMO_PAYMENT");

                    if (isNewPaymentRecord) {
                        paymentRepository.save(payment);
                        System.out.println("Saved new payment record with ID: " + payment.getId() + " for MoMo.");
                    } else {
                        paymentRepository.update(payment);
                        System.out
                                .println("Updated existing payment record with ID: " + payment.getId() + " for MoMo.");
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

                default:
                    throw new IllegalArgumentException(
                            "Unsupported payment method: " + paymentRequestDTO.getPaymentMethod());
            }

        } catch (PayPalRESTException e) {
            System.err.println("PayPal payment processing failed: " + e.getMessage());
            payment.setStatus("FAILED");
            order.setStatus("PAYMENT_FAILED");

            if (payment.getOrder() != null) {
                if (payment.getId() != null) {
                    paymentRepository.update(payment);
                } else if (isNewPaymentRecord) {
                    paymentRepository.save(payment);
                }
            }
            orderRepository.update(order);

            return new PaymentResponseDTO(
                    payment.getId(),
                    order.getId(),
                    paymentRequestDTO.getPaymentMethod(),
                    order.getTotalAmount(),
                    "FAILED",
                    payment.getTransactionId(),
                    payment.getPaymentDate(),
                    "PayPal payment processing failed: " + e.getDetails());
        } catch (Exception e) {
            System.err.println("Payment processing failed for method " + paymentRequestDTO.getPaymentMethod() + ": "
                    + e.getMessage());
            e.printStackTrace();

            payment.setStatus("FAILED");
            order.setStatus("PAYMENT_FAILED");

            if (payment.getOrder() != null) {
                if (isNewPaymentRecord) {
                    paymentRepository.save(payment);
                } else if (payment.getId() != null) {
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
                    null,
                    new Date(),
                    "Payment processing failed: " + e.getMessage());
        }
    }

    private com.paypal.api.payments.Payment createPaypalPaymentObject(Order order, String cancelUrl, String successUrl)
            throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setCurrency("USD");

        double totalWithShipping = order.getTotalAmount();
        if (order.getShippingFee() != null && order.getShippingFee() > 0) {
            totalWithShipping += order.getShippingFee();
            System.out.println("Added shipping fee: " + order.getShippingFee() + " to PayPal payment, new total: "
                    + totalWithShipping);
        }

        String totalAmountStr = BigDecimal.valueOf(totalWithShipping).setScale(2, RoundingMode.HALF_UP).toString();
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
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);

        payment.setRedirectUrls(redirectUrls);
        return payment;
    }

    @Override
    public PaymentResponseDTO executePaypalPayment(String paymentId, String payerId) {
        System.out.println("=== BẮT ĐẦU THỰC HIỆN PAYPAL PAYMENT ===");
        System.out.println("PayPal Payment ID: " + paymentId);
        System.out.println("PayPal Payer ID: " + payerId);

        Payment paymentRecord = paymentRepository.findByTransactionId(paymentId);

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
        payment.setId(paymentId);

        PaymentExecution paymentExecute = new PaymentExecution();
        paymentExecute.setPayerId(payerId);

        try {
            System.out.println("🔄 Đang thực hiện PayPal payment execution...");
            com.paypal.api.payments.Payment executedPayment = payment.execute(apiContext, paymentExecute);
            System.out.println("✅ PayPal payment executed, status: " + executedPayment.getState());

            if (executedPayment.getState().equalsIgnoreCase("approved")) {
                System.out.println("✅ PayPal payment được approve, đang cập nhật payment record...");
                paymentRecord.setStatus("COMPLETED");
                paymentRecord.setPaypalPayerId(payerId);
                if (!executedPayment.getTransactions().isEmpty() &&
                        !executedPayment.getTransactions().get(0).getRelatedResources().isEmpty() &&
                        executedPayment.getTransactions().get(0).getRelatedResources().get(0).getSale() != null) {
                    paymentRecord.setPaypalCaptureId(
                            executedPayment.getTransactions().get(0).getRelatedResources().get(0).getSale().getId());
                }
                paymentRecord.setPaymentDate(new Date());
                order.setStatus("PROCESSING");

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
                paymentRecord.setStatus("FAILED");
                paymentRecord.setPaypalPayerId(payerId);
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
            paymentRecord.setStatus("FAILED");
            order.setStatus("PAYMENT_FAILED");
            if (paymentRecord.getId() != null) {
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

    @Override
    @Transactional
    public boolean updatePaymentStatus(String orderId, String status, String transactionId) {
        try {
            Long orderIdLong = null;
            try {
                orderIdLong = Long.valueOf(orderId);
            } catch (NumberFormatException e) {
                System.err.println("Invalid order ID format: " + orderId);
                return false;
            }

            Payment payment = paymentRepository.findByOrderId(orderIdLong);
            if (payment == null) {
                System.err.println("Payment not found for order ID: " + orderId);
                return false;
            }

            payment.setStatus(status);
            if (transactionId != null && !transactionId.isEmpty()) {
                payment.setTransactionId(transactionId);
            }
            payment.setPaymentDate(new java.util.Date());

            paymentRepository.update(payment);
            if ("COMPLETED".equals(status)) {
                Order order = orderRepository.findById(orderIdLong);
                if (order != null) {
                    order.setStatus("PROCESSING");
                    orderRepository.update(order);
                    System.out.println("Order " + orderId + " status updated to PROCESSING after MoMo payment");

                    String statusNote = "MoMo payment completed (Transaction ID: " +
                            (payment != null ? payment.getTransactionId() : "N/A") + ")";
                    orderService.addOrderStatusHistory(order, "PROCESSING", statusNote, order.getUser().getId());
                    System.out.println("Order status history added for MoMo payment completion");
                }
            }

            return true;
        } catch (Exception e) {
            System.err.println("Error updating payment status: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}