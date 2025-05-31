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
            String orderInfo = "Thanh toan cho don hang " + order.getId();            // Limit orderInfo to 255 characters as per MoMo API requirements
            if (orderInfo.length() > 255) {
                orderInfo = orderInfo.substring(0, 255);
            }
              // Calculate full amount including shipping fee
            double totalAmount = order.getTotalAmount();
            
            // Check if the order has a shipping fee and add it if it's not already included
            if (order.getShippingFee() != null && order.getShippingFee() > 0) {
                // The totalAmount field usually doesn't include shipping fee by default
                // as it's calculated from OrderDetails in calculateTotalAmount()
                totalAmount += order.getShippingFee();
                System.out.println("Added shipping fee: " + order.getShippingFee() + " to MoMo payment, new total: " + totalAmount);
            }
            
            // MoMo requires amount between 1,000 and 50,000,000 VND
            if (totalAmount < 1000) {
                throw new RuntimeException("MoMo payment minimum amount is 1,000 VND");
            } else if (totalAmount > 50000000) {
                throw new RuntimeException("MoMo payment maximum amount is 50,000,000 VND");
            }
            String amount = String.valueOf(Math.round(totalAmount));
            String requestType = moMoConfig.getRequestType();
            String extraData = ""; // Optional // Create raw signature string for API v2 (following MoMo
                                   // documentation order) // Create raw signature string for API v2 (following
                                   // MoMo documentation order)
            // Make sure the parameters are sorted alphabetically by parameter name as
            // required by MoMo
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
            String signature = generateSignature(rawSignature, moMoConfig.getSecretKey());// Create request body for API
                                                                                          // v2
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
            requestBody.put("lang", "vi"); // Send request to MoMo API v2
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json; charset=utf-8"));

            Request request = new Request.Builder()
                    .url(moMoConfig.getEndpoint())
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Content-Length", String.valueOf(jsonBody.length()))
                    .build();
            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    String responseBody = response.body().string();

                    @SuppressWarnings("unchecked")
                    Map<String, Object> momoResponse = objectMapper.readValue(responseBody, Map.class);

                    String resultCode = String.valueOf(momoResponse.get("resultCode"));

                    if ("0".equals(resultCode)) {
                        // Success - MoMo returned payment URL
                        String payUrl = (String) momoResponse.get("payUrl");                        PaymentResponseDTO responseDTO = new PaymentResponseDTO(
                                null, // Payment ID will be set later when payment record is saved
                                order.getId(),
                                PaymentMethod.MOMO,
                                totalAmount, // Use the totalAmount that includes shipping fee
                                "PENDING_MOMO",
                                orderId, // Use MoMo order ID as transaction ID
                                new Date(),
                                "MoMo payment created successfully. RequestId: " + requestId);
                        responseDTO.setRedirectUrl(payUrl);

                        return responseDTO;
                    } else {
                        String message = (String) momoResponse.get("message");

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

                        throw new RuntimeException("MoMo payment creation failed: " + message + " (Code: " + resultCode
                                + ") - " + errorDetail);
                    }
                } else {
                    // In thông tin lỗi chi tiết từ MoMo
                    String errorBody = response.body() != null ? response.body().string() : "No response body";
                    throw new RuntimeException("Failed to connect to MoMo API. HTTP status: " + response.code()
                            + ". Response: " + errorBody);
                }
            }

        } catch (IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error creating MoMo payment: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyMoMoPayment(String partnerCode, String orderId, String requestId,
            String amount, String orderInfo, String orderType,
            String transId, String resultCode, String message,
            String payType, String responseTime, String extraData,
            String signature) {
        try { // Check if result code indicates failure
            if (!"0".equals(resultCode)) {
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
            boolean signaturesMatch = expectedSignature.equals(signature);

            return signaturesMatch;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }

    @Override
    public String generateSignature(String rawData, String secretKey)
            throws NoSuchAlgorithmException, InvalidKeyException {
        try {
            // URL encode rawData for Vietnamese characters if present
            String sanitizedRawData = rawData;

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
            return signature;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
