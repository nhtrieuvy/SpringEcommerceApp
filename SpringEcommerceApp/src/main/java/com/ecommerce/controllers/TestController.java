package com.ecommerce.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import org.springframework.http.ResponseEntity;

@RestController
public class TestController {
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of(
            "message", "API is working!",
            "status", "success",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
