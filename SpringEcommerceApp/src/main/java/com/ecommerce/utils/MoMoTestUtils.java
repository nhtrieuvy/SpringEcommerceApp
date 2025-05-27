package com.ecommerce.utils;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Utility class for testing MoMo integration independently
 * This allows for direct testing of the MoMo API without going through the entire application flow
 */
public class MoMoTestUtils {
    
    private static final OkHttpClient httpClient = new OkHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // MoMo test configuration 
    private static final String PARTNER_CODE = "MOMO";
    private static final String ACCESS_KEY = "F8BBA842ECF85";
    private static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    private static final String ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    private static final String RETURN_URL = "https://localhost:3000/checkout/momo/return";
    private static final String NOTIFY_URL = "https://localhost:8443/api/payments/momo/notify";
    private static final String REQUEST_TYPE = "captureWallet";
    
    /**
     * Send a test MoMo payment request
     * 
     * @param amount Amount in VND
     * @param orderId Order ID
     * @param orderInfo Order info
     * @return Response from MoMo API
     */
    public static Map<String, Object> sendTestPaymentRequest(long amount, String orderId, String orderInfo) {
        try {
            // Generate unique request ID for this test
            String requestId = java.util.UUID.randomUUID().toString();
            String extraData = "";
            
            // Create raw signature string for API v2 (following MoMo documentation order)
            String rawSignature = "accessKey=" + ACCESS_KEY +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + NOTIFY_URL +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + PARTNER_CODE +
                    "&redirectUrl=" + RETURN_URL +
                    "&requestId=" + requestId +
                    "&requestType=" + REQUEST_TYPE;
            
            System.out.println("Raw signature string: " + rawSignature);
            
            // Generate signature
            String signature = generateSignature(rawSignature, SECRET_KEY);
            
            // Create request body for API v2
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("partnerCode", PARTNER_CODE);
            requestBody.put("partnerName", "Test");
            requestBody.put("storeId", "MomoTestStore");
            requestBody.put("storeName", "Test Store");
            requestBody.put("accessKey", ACCESS_KEY);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", String.valueOf(amount));
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", RETURN_URL);
            requestBody.put("ipnUrl", NOTIFY_URL);
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", REQUEST_TYPE);
            requestBody.put("signature", signature);
            requestBody.put("autoCapture", "true");
            requestBody.put("lang", "vi");
            
            // Convert to JSON
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json; charset=utf-8"));
            
            System.out.println("MoMo Test Request: " + jsonBody);
            System.out.println("MoMo Test Endpoint: " + ENDPOINT);
            
            // Send request
            Request request = new Request.Builder()
                    .url(ENDPOINT)
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                System.out.println("MoMo Test Response Code: " + response.code());
                
                if (response.body() != null) {
                    String responseBody = response.body().string();
                    System.out.println("MoMo Test Response Body: " + responseBody);
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> momoResponse = objectMapper.readValue(responseBody, Map.class);
                    return momoResponse;
                } else {
                    throw new RuntimeException("MoMo response body is null");
                }
            }
        } catch (Exception e) {
            System.err.println("Error in MoMo test payment: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("status", "ERROR");
            return errorResponse;
        }
    }
    
    /**
     * Generate HMAC SHA256 signature
     * 
     * @param data Data to sign
     * @param key Secret key
     * @return Signature
     */
    private static String generateSignature(String data, String key) 
            throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);

        byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));

        // Convert to hex string
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }

        return hexString.toString();
    }
    
    /**
     * Run a simple test to verify MoMo integration
     */
    public static void main(String[] args) {
        System.out.println("Starting MoMo test payment...");
        
        // Test parameters
        long amount = 10000; // 10,000 VND
        String orderId = "TEST_ORDER_" + System.currentTimeMillis();
        String orderInfo = "Test payment";
        
        Map<String, Object> response = sendTestPaymentRequest(amount, orderId, orderInfo);
        
        System.out.println("\nTest Results:");
        System.out.println("-----------------");
        
        String resultCode = String.valueOf(response.get("resultCode"));
        System.out.println("Result Code: " + resultCode);
        
        if ("0".equals(resultCode)) {
            System.out.println("Status: SUCCESS");
            System.out.println("Pay URL: " + response.get("payUrl"));
        } else {
            System.out.println("Status: FAILED");
            System.out.println("Message: " + response.get("message"));
        }
    }
}
