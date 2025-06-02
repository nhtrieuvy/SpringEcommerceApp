package com.ecommerce.services.impl;

import com.ecommerce.pojo.CartItem;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.pojo.WishlistItem;
import com.ecommerce.repositories.WishlistItemRepository;
import com.ecommerce.repositories.ProductRepository;
import com.ecommerce.services.CartService;
import com.ecommerce.services.UserService;
import com.ecommerce.services.WishlistService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistItemRepository wishlistItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CartService cartService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String username = authentication.getName();
            return userService.findByUsername(username);
        }
        throw new IllegalStateException("User not authenticated");
    }

    @Override
    public List<WishlistItem> getCurrentUserWishlistItems() {
        try {
            User user = getCurrentUser();
            return wishlistItemRepository.findByUser(user);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    @Transactional
    public WishlistItem addToWishlist(Long productId) {
        try {
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found");
            }
            
            if (wishlistItemRepository.existsByUserAndProduct(user, product)) {
                return null; 
            }
            
            WishlistItem wishlistItem = new WishlistItem();
            wishlistItem.setUser(user);
            wishlistItem.setProduct(product);
            return wishlistItemRepository.save(wishlistItem);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    @Transactional
    public boolean removeFromWishlist(Long productId) {
        try {
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                return false;
            }
            
            wishlistItemRepository.deleteByUserAndProduct(user, product);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean isInWishlist(Long productId) {
        try {
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                return false;
            }
            
            return wishlistItemRepository.existsByUserAndProduct(user, product);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public boolean clearWishlist() {
        try {
            User user = getCurrentUser();
            wishlistItemRepository.deleteAllByUser(user);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public int getWishlistCount() {
        try {
            return getCurrentUserWishlistItems().size();
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    @Transactional
    public boolean moveToCart(Long productId) {
        try {
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                return false;
            }
            
            Optional<WishlistItem> wishlistItemOpt = wishlistItemRepository.findByUserAndProduct(user, product);
            if (wishlistItemOpt.isEmpty()) {
                return false;
            }
            
            CartItem addedCartItem = cartService.addToCart(productId, 1);
            
            if (addedCartItem != null) {
                wishlistItemRepository.deleteByUserAndProduct(user, product);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    @Transactional
    public boolean moveAllToCart() {
        try {
            User user = getCurrentUser();
            List<WishlistItem> wishlistItems = wishlistItemRepository.findByUser(user);
            
            boolean success = true;
            for (WishlistItem item : wishlistItems) {
                CartItem addedCartItem = cartService.addToCart(item.getProduct().getId(), 1);
                if (addedCartItem == null) {
                    success = false;
                }
            }
            
            if (success) {
                wishlistItemRepository.deleteAllByUser(user);
            }
            
            return success;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
