/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ecommerce.utils;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.util.Date;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author huu-thanhduong
 */
@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    
    // SECRET nên được lưu bằng biến môi trường,
    private static final String SECRET = "12345678901234567890123456789012"; // 32 ký tự (AES key)
    private static final long EXPIRATION_MS = 86400000; // 1 ngày

    public static String generateToken(String username) throws Exception {
        JWSSigner signer = new MACSigner(SECRET);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .expirationTime(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .issueTime(new Date())
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claimsSet
        );

        signedJWT.sign(signer);
        
        logger.info("Generated token for user: {}", username);
        
        return signedJWT.serialize();
    }

    public static String validateTokenAndGetUsername(String token) throws Exception {
        if (token == null) {
            logger.warn("Null token passed for validation");
            return null;
        }
        
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(SECRET);

            if (signedJWT.verify(verifier)) {
                Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
                if (expiration != null && expiration.after(new Date())) {
                    String username = signedJWT.getJWTClaimsSet().getSubject();
                    logger.info("Validated token for user: {}", username);
                    return username;
                } else {
                    logger.warn("Token has expired or no expiration date");
                }
            } else {
                logger.warn("Token signature verification failed");
            }
            return null;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage(), e);
            return null;
        }
    }
    
    public static String extractUsername(String token) {
        try {
            String username = validateTokenAndGetUsername(token);
            if (username == null) {
                logger.warn("Could not extract username from token");
            }
            return username;
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage(), e);
            return null;
        }
    }
    
    public static boolean validateToken(String token, String username) {
        try {
            String extractedUsername = validateTokenAndGetUsername(token);
            boolean isValid = extractedUsername != null && extractedUsername.equals(username);
            
            if (!isValid) {
                logger.warn("Token validation failed. Expected username: {}, Extracted: {}", 
                           username, extractedUsername);
            }
            
            return isValid;
        } catch (Exception e) {
            logger.error("Token validation error: {}", e.getMessage(), e);
            return false;
        }
    }
    
    public static String extractUsernameFromRequest(jakarta.servlet.http.HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return extractUsername(token);
        }
        
        // Try to get username from request attribute (might be set by JwtRequestFilter)
        Object usernameAttr = request.getAttribute("username");
        if (usernameAttr != null) {
            return usernameAttr.toString();
        }
        
        return null;
    }
}
