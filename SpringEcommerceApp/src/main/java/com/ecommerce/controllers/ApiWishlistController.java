package com.ecommerce.controllers;

import com.ecommerce.pojo.WishlistItem;
import com.ecommerce.services.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = { "https://localhost:3000", "http://localhost:3000" }, 
        allowCredentials = "true", 
        allowedHeaders = "*", 
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, 
        maxAge = 3600)
public class ApiWishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("")
    public ResponseEntity<List<WishlistItem>> getWishlistItems() {
        try {
            List<WishlistItem> wishlistItems = wishlistService.getCurrentUserWishlistItems();
            return new ResponseEntity<>(wishlistItems, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/items")
    public ResponseEntity<WishlistItem> addToWishlist(@RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.parseLong(payload.get("productId").toString());
            
            // Check if item is already in wishlist
            if (wishlistService.isInWishlist(productId)) {
                return new ResponseEntity<>(HttpStatus.CONFLICT); // 409 Conflict
            }
            
            WishlistItem wishlistItem = wishlistService.addToWishlist(productId);
            if (wishlistItem != null) {
                return new ResponseEntity<>(wishlistItem, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        try {
            boolean removed = wishlistService.removeFromWishlist(productId);
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

    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getWishlistCount() {
        try {
            int count = wishlistService.getWishlistCount();
            Map<String, Integer> response = new HashMap<>();
            response.put("count", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/move-to-cart/{productId}")
    public ResponseEntity<Void> moveToCart(@PathVariable Long productId) {
        try {
            boolean moved = wishlistService.moveToCart(productId);
            if (moved) {
                return new ResponseEntity<>(HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/move-all-to-cart")
    public ResponseEntity<Void> moveAllToCart() {
        try {
            boolean moved = wishlistService.moveAllToCart();
            if (moved) {
                return new ResponseEntity<>(HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> isInWishlist(@PathVariable Long productId) {
        try {
            boolean inWishlist = wishlistService.isInWishlist(productId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("inWishlist", inWishlist);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("")
    public ResponseEntity<Void> clearWishlist() {
        try {
            boolean cleared = wishlistService.clearWishlist();
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
}
