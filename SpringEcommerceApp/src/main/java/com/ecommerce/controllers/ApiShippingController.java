package com.ecommerce.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
@CrossOrigin(origins = { "https://localhost:3000", "http://localhost:3000" }, 
        allowCredentials = "true", 
        allowedHeaders = "*", 
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, 
        maxAge = 3600)
public class ApiShippingController {

    @GetMapping("/methods")
    public ResponseEntity<?> getShippingMethods() {
        try {
            List<Map<String, Object>> shippingMethods = new ArrayList<>();
            
            // Free shipping
            Map<String, Object> freeShipping = new HashMap<>();
            freeShipping.put("id", "free");
            freeShipping.put("name", "Miễn phí vận chuyển");
            freeShipping.put("description", "Miễn phí vận chuyển cho đơn hàng từ 200.000 đ");
            freeShipping.put("price", 0);
            freeShipping.put("minimumOrder", 200000);
            freeShipping.put("estimatedDelivery", "5-7 ngày làm việc");
            
            // Standard shipping
            Map<String, Object> standardShipping = new HashMap<>();
            standardShipping.put("id", "standard");
            standardShipping.put("name", "Vận chuyển tiêu chuẩn");
            standardShipping.put("description", "Vận chuyển tiêu chuẩn");
            standardShipping.put("price", 30000);
            standardShipping.put("minimumOrder", 0);
            standardShipping.put("estimatedDelivery", "3-5 ngày làm việc");
            
            // Express shipping
            Map<String, Object> expressShipping = new HashMap<>();
            expressShipping.put("id", "express");
            expressShipping.put("name", "Vận chuyển nhanh");
            expressShipping.put("description", "Vận chuyển nhanh");
            expressShipping.put("price", 60000);
            expressShipping.put("minimumOrder", 0);
            expressShipping.put("estimatedDelivery", "1-2 ngày làm việc");
            
            shippingMethods.add(freeShipping);
            shippingMethods.add(standardShipping);
            shippingMethods.add(expressShipping);
            
            return ResponseEntity.ok(shippingMethods);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
