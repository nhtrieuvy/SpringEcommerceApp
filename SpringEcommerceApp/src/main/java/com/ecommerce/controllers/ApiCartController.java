package com.ecommerce.controllers;

import com.ecommerce.pojo.CartItem;
import com.ecommerce.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = { "https://localhost:3000", "http://localhost:3000" }, 
        allowCredentials = "true", 
        allowedHeaders = "*", 
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, 
        maxAge = 3600)
public class ApiCartController {

    @Autowired
    private CartService cartService;

    @GetMapping("")
    public ResponseEntity<List<CartItem>> getCartItems() {
        try {
            List<CartItem> cartItems = cartService.getCurrentUserCartItems();
            return new ResponseEntity<>(cartItems, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/items")
    public ResponseEntity<CartItem> addToCart(@RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.parseLong(payload.get("productId").toString());
            int quantity = Integer.parseInt(payload.get("quantity").toString());
            
            if (quantity <= 0) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            CartItem cartItem = cartService.addToCart(productId, quantity);
            if (cartItem != null) {
                return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long productId) {
        try {
            boolean removed = cartService.removeFromCart(productId);
            if (removed) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable Long productId, 
            @RequestBody Map<String, Object> payload) {
        try {
            int quantity = Integer.parseInt(payload.get("quantity").toString());
            
            if (quantity <= 0) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            CartItem cartItem = cartService.updateQuantity(productId, quantity);
            if (cartItem != null) {
                return new ResponseEntity<>(cartItem, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("")
    public ResponseEntity<Void> clearCart() {
        try {
            boolean cleared = cartService.clearCart();
            if (cleared) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getCartCount() {
        try {
            int count = cartService.getCartCount();
            Map<String, Integer> response = new HashMap<>();
            response.put("count", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/subtotal")
    public ResponseEntity<Map<String, Double>> getSubtotal() {
        try {
            double subtotal = cartService.getSubtotal();
            Map<String, Double> response = new HashMap<>();
            response.put("subtotal", subtotal);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/validate-coupon")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, String> payload) {
        try {
            String couponCode = payload.get("couponCode");
            if (couponCode == null || couponCode.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            CartService.CouponValidationResult result = cartService.validateCoupon(couponCode);
            Map<String, Object> response = new HashMap<>();
            response.put("isValid", result.isValid());
            response.put("discount", result.getDiscount());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
