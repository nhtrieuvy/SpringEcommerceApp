package com.ecommerce.controllers;

import com.ecommerce.dtos.PaymentRequestDTO;
import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Payment;
import com.ecommerce.pojo.PaymentMethod;
import com.ecommerce.services.PaymentService;
import com.ecommerce.services.MoMoService;
import com.ecommerce.configs.MomoConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true")
public class ApiPaymentController {
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MoMoService moMoService;

    @Autowired
    private MomoConfig moMoConfig;

    /**
     * Get all payments (admin endpoint with pagination)
     */
    @GetMapping
    public ResponseEntity<?> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<Payment> payments = paymentService.findAll();
            return ResponseEntity.ok(Map.of(
                    "payments", payments,
                    "total", payments.size(),
                    "page", page,
                    "size", size));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve payments: " + e.getMessage()));
        }
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            Payment payment = paymentService.findById(id);
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve payment: " + e.getMessage()));
        }
    }

    /**
     * Get payment status by order ID
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatusByOrderId(@PathVariable Long orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);
            if (payment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Payment not found for order ID: " + orderId));
            }

            PaymentResponseDTO responseDTO = new PaymentResponseDTO(
                    payment.getId(),
                    orderId,
                    payment.getPaymentMethod(),
                    payment.getAmount(),
                    payment.getStatus(),
                    payment.getTransactionId(),
                    payment.getPaymentDate(),
                    "Payment status retrieved successfully");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve payment status: " + e.getMessage()));
        }
    }

    /**
     * Process payment for all payment methods (COD, PayPal, MoMo, etc.)
     * This is the main endpoint for payment processing
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody @Valid PaymentRequestDTO paymentRequestDTO,
            HttpServletRequest request) {
        try {
            // Set default URLs based on payment method
            setDefaultUrls(paymentRequestDTO, request);

            PaymentResponseDTO paymentResponse = paymentService.processPayment(paymentRequestDTO);
            return ResponseEntity.ok(paymentResponse);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Helper method to set default URLs based on payment method
     */
    private void setDefaultUrls(PaymentRequestDTO paymentRequestDTO, HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

        if (paymentRequestDTO.getPaymentMethod() == PaymentMethod.PAYPAL) {
            if (paymentRequestDTO.getSuccessUrl() == null || paymentRequestDTO.getSuccessUrl().isEmpty()) {
                paymentRequestDTO.setSuccessUrl(baseUrl + "/api/payments/paypal/success");
            }
            if (paymentRequestDTO.getCancelUrl() == null || paymentRequestDTO.getCancelUrl().isEmpty()) {
                paymentRequestDTO.setCancelUrl(baseUrl + "/api/payments/paypal/cancel");
            }
        } else if (paymentRequestDTO.getPaymentMethod() == PaymentMethod.MOMO) {
            // For MoMo, we use the provided frontend URLs or default to configuration URLs
            // Don't modify frontend provided URLs as they are already complete absolute
            // URLs
            if (paymentRequestDTO.getSuccessUrl() == null || paymentRequestDTO.getSuccessUrl().isEmpty()) {
                paymentRequestDTO.setSuccessUrl(moMoConfig.getReturnUrl());
            }
            if (paymentRequestDTO.getCancelUrl() == null || paymentRequestDTO.getCancelUrl().isEmpty()) {
                paymentRequestDTO.setCancelUrl(moMoConfig.getReturnUrl());
            }
        }
    }

    /**
     * Execute PayPal payment after user approval
     */
    @PostMapping("/paypal/execute")
    public ResponseEntity<?> executePaypalPayment(@RequestBody Map<String, String> paypalData) {
        try {
            String paymentId = paypalData.get("paymentId");
            String payerId = paypalData.get("payerId");

            if (paymentId == null || payerId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "PayPal paymentId and payerId are required"));
            }

            PaymentResponseDTO response = paymentService.executePaypalPayment(paymentId, payerId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to execute PayPal payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Create MoMo payment specifically (alternative endpoint)
     * This endpoint does the same as /process but is MoMo-specific for frontend
     * compatibility
     */    @PostMapping("/momo/create")
    public ResponseEntity<?> createMoMoPayment(@RequestBody @Valid PaymentRequestDTO paymentRequestDTO,
            HttpServletRequest request) {
        try {
            // Log the incoming payment request
            System.out.println("Received MoMo payment request for order: " + paymentRequestDTO.getOrderId());
            
            // Ensure payment method is MoMo
            paymentRequestDTO.setPaymentMethod(PaymentMethod.MOMO);

            // Set default MoMo URLs
            setDefaultUrls(paymentRequestDTO, request);
            System.out.println("MoMo URLs configured - returnUrl: " + paymentRequestDTO.getSuccessUrl());

            PaymentResponseDTO paymentResponse = paymentService.processPayment(paymentRequestDTO);
            System.out.println("MoMo payment processing completed with status: " + paymentResponse.getStatus());
            
            if (paymentResponse.getRedirectUrl() != null) {
                System.out.println("MoMo redirect URL: " + paymentResponse.getRedirectUrl());
            }
            
            return ResponseEntity.ok(paymentResponse);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("MoMo payment creation error: " + e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create MoMo payment: " + e.getMessage());
            error.put("details", e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Handle MoMo payment return (user redirected back from MoMo)
     */
    @GetMapping("/momo/return")
    public ResponseEntity<?> handleMoMoReturn(@RequestParam Map<String, String> allParams) {
        try {
            // Log all parameters for debugging
            System.out.println("MoMo Return called with parameters: " + allParams);

            // Extract MoMo callback parameters
            String partnerCode = allParams.get("partnerCode");
            String orderId = allParams.get("orderId");
            String requestId = allParams.get("requestId");
            String amount = allParams.get("amount");
            String orderInfo = allParams.get("orderInfo");
            String orderType = allParams.get("orderType");
            String transId = allParams.get("transId");
            String resultCode = allParams.get("resultCode");
            String message = allParams.get("message");
            String payType = allParams.get("payType");
            String responseTime = allParams.get("responseTime");
            String extraData = allParams.get("extraData");
            String signature = allParams.get("signature");

            // Log specific details
            System.out.println("MoMo Payment ResultCode: " + resultCode);
            System.out.println("MoMo Payment Message: " + message);
            System.out.println("MoMo Payment TransId: " + transId);

            // Verify payment with MoMo
            boolean isValidPayment = moMoService.verifyMoMoPayment(
                    partnerCode, orderId, requestId, amount, orderInfo, orderType,
                    transId, resultCode, message, payType, responseTime, extraData, signature);

            System.out.println("MoMo Payment Signature Valid: " + isValidPayment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("resultCode", resultCode);
            response.put("message", message);
            response.put("transId", transId);
            response.put("isValid", isValidPayment);

            if (isValidPayment && "0".equals(resultCode)) {
                response.put("status", "success");
                response.put("paymentStatus", "COMPLETED");
                System.out.println("MoMo Payment Successful!");
            } else {
                response.put("status", "failed");
                response.put("paymentStatus", "FAILED");
                System.out.println("MoMo Payment Failed: " + message + " (Code: " + resultCode + ")");                // Add detailed debug info based on MoMo documentation
                if (resultCode != null) {
                    switch (resultCode) {
                        case "1001":
                            response.put("errorDetail", "Giao dịch thất bại do tài khoản không đủ tiền");
                            break;
                        case "1003":
                            response.put("errorDetail", "Giao dịch đã bị hủy");
                            break;
                        case "1004":
                            response.put("errorDetail", "Giao dịch thất bại do vượt quá hạn mức thanh toán ngày/tháng");
                            break;
                        case "1005":
                            response.put("errorDetail", "URL hoặc mã QR đã hết hạn");
                            break;
                        case "1006":
                            response.put("errorDetail", "Người dùng đã từ chối xác nhận thanh toán");
                            break;
                        case "1007":
                            response.put("errorDetail", "Tài khoản người dùng không hoạt động hoặc không tồn tại");
                            break;
                        case "7000":
                        case "7002":
                            response.put("errorDetail", "Giao dịch đang được xử lý, vui lòng thử lại sau");
                            break;
                        case "9000":
                            response.put("errorDetail", "Giao dịch đã được xác thực nhưng chưa hoàn tất");
                            break;
                        case "11":
                            response.put("errorDetail", "Truy cập bị từ chối - Vui lòng kiểm tra cấu hình");
                            break;
                        case "12":
                            response.put("errorDetail", "Phiên bản API không được hỗ trợ");
                            break;
                        case "13":
                            response.put("errorDetail", "Xác thực merchant thất bại - Kiểm tra thông tin đăng ký");
                            break;
                        case "21":
                        case "22":
                            response.put("errorDetail", "Số tiền không hợp lệ hoặc nằm ngoài phạm vi cho phép");
                            break;
                        case "40":
                            response.put("errorDetail", "RequestId trùng lặp");
                            break;
                        case "41":
                            response.put("errorDetail", "OrderId trùng lặp");
                            break;
                        case "42":
                            response.put("errorDetail", "OrderId không hợp lệ hoặc không tìm thấy");
                            break;
                        default:
                            response.put("errorDetail", "Lỗi không xác định (Mã: " + resultCode + ")");
                    }
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in MoMo return callback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing MoMo payment return: " + e.getMessage()));
        }
    }

    /**
     * Handle MoMo payment notification (IPN - webhook from MoMo)
     */
    @PostMapping("/momo/notify")
    public ResponseEntity<?> handleMoMoNotify(@RequestParam Map<String, String> allParams) {
        try {
            // Extract MoMo callback parameters
            String partnerCode = allParams.get("partnerCode");
            String orderId = allParams.get("orderId");
            String requestId = allParams.get("requestId");
            String amount = allParams.get("amount");
            String orderInfo = allParams.get("orderInfo");
            String orderType = allParams.get("orderType");
            String transId = allParams.get("transId");
            String resultCode = allParams.get("resultCode");
            String message = allParams.get("message");
            String payType = allParams.get("payType");
            String responseTime = allParams.get("responseTime");
            String extraData = allParams.get("extraData");
            String signature = allParams.get("signature");

            System.out.println("MoMo IPN received - Order ID: " + orderId + ", Result Code: " + resultCode);

            // Verify payment with MoMo
            boolean isValidPayment = moMoService.verifyMoMoPayment(
                    partnerCode, orderId, requestId, amount, orderInfo, orderType,
                    transId, resultCode, message, payType, responseTime, extraData, signature);

            if (isValidPayment) {
                if ("0".equals(resultCode)) {
                    System.out.println("MoMo payment confirmed for order: " + orderId);
                    return ResponseEntity.ok("Payment confirmed");
                } else {
                    System.out.println("MoMo payment failed for order: " + orderId + ", message: " + message);
                    return ResponseEntity.ok("Payment failed");
                }
            } else {
                System.err.println("Invalid MoMo signature for order: " + orderId);
                return ResponseEntity.badRequest().body("Invalid signature");
            }
        } catch (Exception e) {
            System.err.println("Error in MoMo IPN callback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing notification");
        }
    }
    
    /**
     * Check MoMo server health status
     */
    @GetMapping("/momo/health-check")
    public ResponseEntity<?> checkMomoServerStatus() {
        try {
            boolean isAvailable = moMoService.checkMoMoServerStatus();
            Map<String, Object> status = new HashMap<>();
            status.put("status", isAvailable ? "UP" : "DOWN");
            status.put("timestamp", new java.util.Date().getTime());
            
            // Add MoMo configuration details for debugging
            Map<String, String> config = new HashMap<>();
            config.put("endpoint", moMoConfig.getEndpoint());
            config.put("returnUrl", moMoConfig.getReturnUrl());
            config.put("notifyUrl", moMoConfig.getNotifyUrl());
            status.put("config", config);

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "ERROR", 
                    "message", "Error checking MoMo server status: " + e.getMessage()
                ));
        }
    }
}
