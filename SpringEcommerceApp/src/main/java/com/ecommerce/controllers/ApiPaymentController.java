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
public class ApiPaymentController {
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private MoMoService moMoService;
    @Autowired
    private MomoConfig moMoConfig;

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

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody @Valid PaymentRequestDTO paymentRequestDTO,
            HttpServletRequest request) {
        try {
            setDefaultUrls(paymentRequestDTO, request);
            PaymentResponseDTO paymentResponse = paymentService.processPayment(paymentRequestDTO);
            return ResponseEntity.ok(paymentResponse);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

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
            if (paymentRequestDTO.getSuccessUrl() == null || paymentRequestDTO.getSuccessUrl().isEmpty()) {
                paymentRequestDTO.setSuccessUrl(moMoConfig.getReturnUrl());
            }
            if (paymentRequestDTO.getCancelUrl() == null || paymentRequestDTO.getCancelUrl().isEmpty()) {
                paymentRequestDTO.setCancelUrl(moMoConfig.getReturnUrl());
            }
        }
    }

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

    @PostMapping("/momo/create")
    public ResponseEntity<?> createMoMoPayment(@RequestBody @Valid PaymentRequestDTO paymentRequestDTO,
            HttpServletRequest request) {
        try {
            paymentRequestDTO.setPaymentMethod(PaymentMethod.MOMO);
            setDefaultUrls(paymentRequestDTO, request);
            PaymentResponseDTO paymentResponse = paymentService.processPayment(paymentRequestDTO);
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

    @GetMapping("/momo/return")
    public ResponseEntity<?> handleMoMoReturn(@RequestParam Map<String, String> allParams) {
        try {
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
            String frontendBaseUrl = "https://localhost:3000";
            String redirectUrl;
            if ("0".equals(resultCode)) {
                String extractedOrderId = extractOrderIdFromMoMoOrderId(orderId);
                boolean isValidPayment = moMoService.verifyMoMoPayment(
                        partnerCode, orderId, requestId, amount, orderInfo, orderType,
                        transId, resultCode, message, payType, responseTime, extraData, signature);
                if (isValidPayment) {
                    boolean paymentUpdated = paymentService.updatePaymentStatus(extractedOrderId, "COMPLETED", transId);
                    redirectUrl = frontendBaseUrl + "/checkout/momo/return?" +
                            "status=success&" +
                            "orderNumber=" + extractedOrderId + "&" +
                            "transactionId=" + transId + "&" +
                            "message=" + java.net.URLEncoder.encode("Thanh toán MoMo thành công", "UTF-8") + "&" +
                            "paymentUpdated=" + paymentUpdated;
                } else {
                    redirectUrl = frontendBaseUrl + "/checkout/momo/return?" +
                            "status=error&" +
                            "message=" + java.net.URLEncoder.encode("Xác thực thanh toán không hợp lệ", "UTF-8") + "&" +
                            "resultCode=" + resultCode;
                }
            } else {
                String errorMessage = message != null ? message : "Thanh toán thất bại";
                String errorDetail = mapMoMoErrorCode(resultCode);
                String extractedOrderId = extractOrderIdFromMoMoOrderId(orderId);
                System.out.println("MoMo payment return failed for order: " + orderId +
                        ", message: " + message + ", resultCode: " + resultCode);
                redirectUrl = frontendBaseUrl + "/checkout/momo/return?" +
                        "status=error&" +
                        "message=" + java.net.URLEncoder.encode(errorMessage, "UTF-8") + "&" +
                        "errorDetail=" + java.net.URLEncoder.encode(errorDetail, "UTF-8") + "&" +
                        "resultCode=" + resultCode + "&" +
                        "orderNumber=" + extractedOrderId;
            }
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
        } catch (Exception e) {
            System.err.println("Error in MoMo return callback: " + e.getMessage());
            e.printStackTrace();
            String frontendBaseUrl = "https://localhost:3000";
            try {
                String errorRedirectUrl = frontendBaseUrl + "/checkout/momo/return?" +
                        "status=error&" +
                        "message=" + java.net.URLEncoder.encode("Có lỗi xảy ra khi xử lý kết quả thanh toán", "UTF-8");
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", errorRedirectUrl)
                        .build();
            } catch (Exception urlException) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "status", "error",
                                "message", "Có lỗi xảy ra khi xử lý kết quả thanh toán",
                                "error", e.getMessage()));
            }
        }
    }

    @PostMapping("/momo/notify")
    public ResponseEntity<?> handleMoMoNotify(@RequestParam Map<String, String> allParams) {
        try {
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
            boolean isValidPayment = moMoService.verifyMoMoPayment(
                    partnerCode, orderId, requestId, amount, orderInfo, orderType,
                    transId, resultCode, message, payType, responseTime, extraData, signature);
            if (isValidPayment) {
                if ("0".equals(resultCode)) {
                    String extractedOrderId = extractOrderIdFromMoMoOrderId(orderId);
                    boolean paymentUpdated = paymentService.updatePaymentStatus(extractedOrderId, "COMPLETED", transId);
                    System.out.println(
                            "MoMo payment confirmed for order: " + extractedOrderId + ", updated: " + paymentUpdated);
                    return ResponseEntity.ok(Map.of(
                            "status", "success",
                            "message", "Payment confirmed",
                            "paymentUpdated", paymentUpdated));
                } else {
                    System.out.println("MoMo payment failed for order: " + orderId + ", message: " + message);
                    return ResponseEntity.ok(Map.of(
                            "status", "failed",
                            "message", "Payment failed: " + message));
                }
            } else {
                System.err.println("Invalid MoMo signature for order: " + orderId);
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "Invalid signature"));
            }
        } catch (Exception e) {
            System.err.println("Error in MoMo IPN callback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing notification");
        }
    }

    private String extractOrderIdFromMoMoOrderId(String momoOrderId) {
        if (momoOrderId == null) {
            return null;
        }
        System.out.println("Extracting order ID from MoMo order ID: " + momoOrderId);
        if (momoOrderId.startsWith("ORDER_")) {
            String extracted = momoOrderId.substring("ORDER_".length());
            System.out.println("Full extracted part (after ORDER_ prefix): " + extracted);
            if (extracted.contains("_")) {
                String orderIdPart = extracted.split("_")[0];
                System.out.println("Extracted order ID (first part before underscore): " + orderIdPart);
                try {
                    Long.parseLong(orderIdPart);
                    return orderIdPart;
                } catch (NumberFormatException e) {
                    System.out.println("Extracted part is not numeric: " + orderIdPart);
                }
            }
            System.out.println("Extracted order ID (no underscore found): " + extracted);
            return extracted;
        }
        if (momoOrderId.contains("orderId=ORDER_")) {
            int startIndex = momoOrderId.indexOf("orderId=ORDER_") + "orderId=ORDER_".length();
            int endIndex = momoOrderId.indexOf("&", startIndex);
            if (endIndex == -1)
                endIndex = momoOrderId.length();
            String extracted = momoOrderId.substring(startIndex, endIndex);
            System.out.println("Extracted from URL parameter: " + extracted);
            if (extracted.contains("_")) {
                String orderIdPart = extracted.split("_")[0];
                System.out.println("Extracted order ID from URL (first part before underscore): " + orderIdPart);
                try {
                    Long.parseLong(orderIdPart);
                    return orderIdPart;
                } catch (NumberFormatException e) {
                    System.out.println("Extracted part from URL is not numeric: " + orderIdPart);
                }
            }
            return extracted;
        }
        try {
            Long.parseLong(momoOrderId);
            return momoOrderId;
        } catch (NumberFormatException e) {
            return momoOrderId;
        }
    }

    private String mapMoMoErrorCode(String resultCode) {
        if (resultCode == null)
            return "Lỗi không xác định";
        switch (resultCode) {
            case "0":
                return "Thành công";
            case "1":
                return "Lỗi hệ thống MoMo";
            case "2":
                return "Lỗi cấu hình merchant";
            case "4":
                return "Số tiền không hợp lệ";
            case "8":
                return "Chữ ký không hợp lệ";
            case "11":
                return "Không tìm thấy đơn hàng";
            case "25":
                return "Địa chỉ IP không được phép";
            case "32":
                return "Đơn hàng đã tồn tại";
            case "1000":
                return "Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán";
            case "1001":
                return "Giao dịch thành công (nhưng chưa capture)";
            case "1003":
                return "Giao dịch bị hủy";
            case "1004":
                return "Giao dịch thất bại do tài khoản người dùng không đủ tiền";
            case "1005":
                return "Giao dịch thất bại do url hoặc QR code đã hết hạn";
            case "1006":
                return "Giao dịch thất bại do người dùng đã decline";
            case "1007":
                return "Giao dịch đang được xử lý";
            case "9000":
                return "Giao dịch được authorized thành công";
            default:
                return "Lỗi không xác định (Mã: " + resultCode + ")";
        }
    }
}
