package com.ecommerce.services.impl;

import com.ecommerce.configs.MomoConfig;
import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.PaymentMethod;
import com.ecommerce.services.MoMoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import okhttp3.*;

@Service
public class MoMoServiceImpl implements MoMoService {

    @Autowired
    private MomoConfig moMoConfig;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PaymentResponseDTO createMoMoPayment(Order order) {
        try {
            // Generate unique request ID
            String requestId = UUID.randomUUID().toString();
            String orderId = "ORDER_" + order.getId() + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh toan cho don hang " + order.getId();
            // Limit orderInfo to 255 characters as per MoMo API requirements
            if (orderInfo.length() > 255) {
                orderInfo = orderInfo.substring(0, 255);
            }            // Ensure amount is a whole number with no decimals as MoMo expects
            double totalAmount = order.getTotalAmount();
            // MoMo requires amount between 1,000 and 50,000,000 VND
            if (totalAmount < 1000) {
                throw new RuntimeException("MoMo payment minimum amount is 1,000 VND");
            } else if (totalAmount > 50000000) {
                throw new RuntimeException("MoMo payment maximum amount is 50,000,000 VND");
            }
            String amount = String.valueOf(Math.round(totalAmount));
            String requestType = moMoConfig.getRequestType();
            String extraData = ""; // Optional // Create raw signature string for API v2 (following MoMo
                                   // documentation order)            // Create raw signature string for API v2 (following MoMo documentation order)
            // Make sure the parameters are sorted alphabetically by parameter name as required by MoMo
            String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + moMoConfig.getNotifyUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + moMoConfig.getPartnerCode() +
                    "&redirectUrl=" + moMoConfig.getReturnUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;
            
            System.out.println("Raw signature string: " + rawSignature);

            String signature = generateSignature(rawSignature, moMoConfig.getSecretKey());            // Create request body for API v2
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("partnerCode", moMoConfig.getPartnerCode());
            requestBody.put("partnerName", "Test"); 
            requestBody.put("storeId", "MomoTestStore"); 
            requestBody.put("storeName", "Test Store"); // Add store name as required
            requestBody.put("accessKey", moMoConfig.getAccessKey());
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", moMoConfig.getReturnUrl());
            requestBody.put("ipnUrl", moMoConfig.getNotifyUrl());
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", requestType);
            requestBody.put("signature", signature);
            requestBody.put("autoCapture", "true"); // Ensure automatic capture
            requestBody.put("lang", "vi");// Send request to MoMo API v2
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json; charset=utf-8"));

            System.out.println("MoMo Request: " + jsonBody);
            System.out.println("MoMo Endpoint: " + moMoConfig.getEndpoint());            Request request = new Request.Builder()
                    .url(moMoConfig.getEndpoint())
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Content-Length", String.valueOf(jsonBody.length()))
                    .build();            try (Response response = httpClient.newCall(request).execute()) {
                System.out.println("MoMo API response status code: " + response.code());
                
                if (response.isSuccessful() && response.body() != null) {
                    String responseBody = response.body().string();
                    System.out.println("MoMo API raw response: " + responseBody);
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> momoResponse = objectMapper.readValue(responseBody, Map.class);
                    System.out.println("MoMo API parsed response: " + momoResponse);
                    
                    String resultCode = String.valueOf(momoResponse.get("resultCode"));
                    System.out.println("MoMo resultCode: " + resultCode);
                    
                    if ("0".equals(resultCode)) {
                        // Success - MoMo returned payment URL
                        String payUrl = (String) momoResponse.get("payUrl");
                        System.out.println("MoMo payment URL: " + payUrl);
                        
                        PaymentResponseDTO responseDTO = new PaymentResponseDTO(
                                null, // Payment ID will be set later when payment record is saved
                                order.getId(),
                                PaymentMethod.MOMO,
                                order.getTotalAmount(),
                                "PENDING_MOMO",
                                orderId, // Use MoMo order ID as transaction ID
                                new Date(),
                                "MoMo payment created successfully. RequestId: " + requestId);
                        responseDTO.setRedirectUrl(payUrl);

                        return responseDTO;
                    } else {
                        String message = (String) momoResponse.get("message");
                        // Log detailed error information
                        System.err.println("MoMo payment failed with resultCode: " + resultCode);
                        System.err.println("MoMo error message: " + message);
                        System.err.println("Full MoMo response: " + momoResponse);
                        
                        // Check common MoMo error codes
                        String errorDetail = "Unknown error";
                        switch (resultCode) {
                            case "1":
                                errorDetail = "MoMo payment system error";
                                break;
                            case "2":
                                errorDetail = "Merchant credentials configuration error";
                                break;
                            case "4":
                                errorDetail = "Invalid amount";
                                break;
                            case "8":
                                errorDetail = "Invalid signature";
                                break;
                            case "11":
                                errorDetail = "Order not found";
                                break;
                            case "25":
                                errorDetail = "Invalid location (website/IP address not whitelisted)";
                                break;
                            case "32":
                                errorDetail = "Invalid merchant credentials (check partnerCode/accessKey/secretKey)";
                                break;
                        }
                        System.err.println("MoMo error details: " + errorDetail);
                        
                        throw new RuntimeException("MoMo payment creation failed: " + message + " (Code: " + resultCode + ") - " + errorDetail);
                    }} else {
                    // In thông tin lỗi chi tiết từ MoMo
                    String errorBody = response.body() != null ? response.body().string() : "No response body";
                    System.err.println("MoMo API Error Response: " + errorBody);
                    throw new RuntimeException("Failed to connect to MoMo API. HTTP status: " + response.code() + ". Response: " + errorBody);
                }
            }

        } catch (IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error creating MoMo payment: " + e.getMessage(), e);
        }
    }    @Override
    public boolean verifyMoMoPayment(String partnerCode, String orderId, String requestId,
            String amount, String orderInfo, String orderType,
            String transId, String resultCode, String message,
            String payType, String responseTime, String extraData,
            String signature) {
        try {
            // Log payment details to help with debugging
            System.out.println("Verifying MoMo payment with resultCode: " + resultCode);
            System.out.println("MoMo message: " + message);
            System.out.println("MoMo transId: " + transId);
            
            // Check if result code indicates failure
            if (!"0".equals(resultCode)) {
                System.err.println("MoMo payment verification failed with resultCode: " + resultCode);
                System.err.println("MoMo error message: " + message);
                return false;
            }
            
            // Recreate signature for verification
            String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&message=" + message +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&orderType=" + orderType +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + payType +
                    "&requestId=" + requestId +
                    "&responseTime=" + responseTime +
                    "&resultCode=" + resultCode +
                    "&transId=" + transId;

            String expectedSignature = generateSignature(rawSignature, moMoConfig.getSecretKey());
            
            // Log signature comparison for debugging
            System.out.println("Received signature: " + signature);
            System.out.println("Expected signature: " + expectedSignature);
            
            boolean signaturesMatch = expectedSignature.equals(signature);
            if (!signaturesMatch) {
                System.err.println("MoMo signature verification failed - signatures do not match");
            }
            
            return signaturesMatch;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            System.err.println("Error verifying MoMo signature: " + e.getMessage());
            return false;
        }
    }    @Override
    public String generateSignature(String rawData, String secretKey)
            throws NoSuchAlgorithmException, InvalidKeyException {
        try {
            // URL encode rawData for Vietnamese characters if present
            String sanitizedRawData = rawData;
            
            // Log raw signature data for debugging
            System.out.println("Raw signature data before processing: " + rawData);
            
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            // Use UTF-8 encoding - this is the standard for MoMo API v2
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hash = sha256_HMAC.doFinal(sanitizedRawData.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            String signature = hexString.toString();
            System.out.println("Generated signature: " + signature + " for data: " + sanitizedRawData);
            return signature;
        } catch (Exception e) {
            System.err.println("Error generating signature: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Check MoMo API server status
     * @return true if MoMo API is reachable and responding properly
     */
    public boolean checkMoMoServerStatus() {
        try {
            Request request = new Request.Builder()
                    .url("https://test-payment.momo.vn/v2/gateway/api/create")
                    .head()  // Use HEAD request to check server availability
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                boolean isAvailable = response.isSuccessful();
                System.out.println("MoMo server status check: " + (isAvailable ? "AVAILABLE" : "UNAVAILABLE") + 
                                   " (Status code: " + response.code() + ")");
                return isAvailable;
            }
        } catch (Exception e) {
            System.err.println("Error checking MoMo server status: " + e.getMessage());
            return false;
        }
    }
}
