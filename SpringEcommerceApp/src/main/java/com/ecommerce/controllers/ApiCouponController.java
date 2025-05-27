package com.ecommerce.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = { "https://localhost:3000", "http://localhost:3000" }, 
        allowCredentials = "true", 
        allowedHeaders = "*", 
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, 
        maxAge = 3600)
public class ApiCouponController {

    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, String> payload) {
        try {
            String code = payload.get("code");
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("isValid", false, "message", "Mã giảm giá không hợp lệ"));
            }

            Map<String, Object> response = new HashMap<>();
            
            // Simple coupon validation logic for demo
            if (code.equalsIgnoreCase("SALE10")) {
                response.put("isValid", true);
                response.put("discount", 10);
                response.put("minimumOrder", 100000);
                response.put("message", "Mã giảm giá 10% đã được áp dụng");
            } else if (code.equalsIgnoreCase("SALE20")) {
                response.put("isValid", true);
                response.put("discount", 20);
                response.put("minimumOrder", 200000);
                response.put("message", "Mã giảm giá 20% đã được áp dụng");
            } else if (code.equalsIgnoreCase("FREE")) {
                response.put("isValid", true);
                response.put("discount", 100);
                response.put("minimumOrder", 1000000);
                response.put("message", "Mã giảm giá 100% đã được áp dụng");
            } else {
                response.put("isValid", false);
                response.put("message", "Mã giảm giá không tồn tại");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("isValid", false, "message", "Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }
}
