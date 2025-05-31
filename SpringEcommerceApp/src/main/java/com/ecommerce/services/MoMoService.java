package com.ecommerce.services;

import com.ecommerce.dtos.PaymentResponseDTO;
import com.ecommerce.pojo.Order;

public interface MoMoService {
    /**
     * Creates a MoMo payment request and returns payment URL
     * @param order The order to create payment for
     * @return PaymentResponseDTO with MoMo payment URL
     */
    PaymentResponseDTO createMoMoPayment(Order order);
    
    /**
     * Verifies MoMo payment callback
     * @param partnerCode MoMo partner code
     * @param orderId Order ID  
     * @param requestId Request ID
     * @param amount Payment amount
     * @param orderInfo Order information
     * @param orderType Order type
     * @param transId Transaction ID
     * @param resultCode Result code
     * @param message Message
     * @param payType Payment type
     * @param responseTime Response time
     * @param extraData Extra data
     * @param signature Signature for verification
     * @return true if payment is valid
     */
    boolean verifyMoMoPayment(String partnerCode, String orderId, String requestId, 
                             String amount, String orderInfo, String orderType, 
                             String transId, String resultCode, String message, 
                             String payType, String responseTime, String extraData, 
                             String signature);
    
    /**
     * Generate HMAC SHA256 signature for MoMo API
     * @param rawData Data to sign
     * @param secretKey Secret key for signing
     * @return Signature string
     * @throws java.security.NoSuchAlgorithmException
     * @throws java.security.InvalidKeyException
     */    String generateSignature(String rawData, String secretKey) 
            throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException;
}
