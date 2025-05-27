package com.ecommerce.services.impl;

import com.ecommerce.pojo.CartItem;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.CartItemRepository;
import com.ecommerce.repositories.ProductRepository;
import com.ecommerce.services.CartService;
import com.ecommerce.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String username = authentication.getName();
            return userService.findByUsername(username);
        }
        throw new IllegalStateException("User not authenticated");
    }

    @Override
    public List<CartItem> getCurrentUserCartItems() {
        try {
            User user = getCurrentUser();
            return cartItemRepository.findByUser(user);
        } catch (Exception e) {
            // Handle case when user is not authenticated
            return List.of();
        }
    }    @Override
    @Transactional
    public CartItem addToCart(Long productId, int quantity) {
        try {
            if (quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be positive");
            }
            
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found");
            }
            
            // Check if product is already in cart
            Optional<CartItem> existingCartItem = cartItemRepository.findByUserAndProduct(user, product);
            
            if (existingCartItem.isPresent()) {
                CartItem cartItem = existingCartItem.get();
                cartItem.setQuantity(cartItem.getQuantity() + quantity);
                return cartItemRepository.save(cartItem);
            } else {
                CartItem cartItem = new CartItem();
                cartItem.setUser(user);
                cartItem.setProduct(product);
                cartItem.setQuantity(quantity);
                return cartItemRepository.save(cartItem);
            }
        } catch (Exception e) {
            // Log the exception
            e.printStackTrace();
            return null;
        }
    }    @Override
    @Transactional
    public boolean removeFromCart(Long productId) {
        try {
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                return false;
            }
            
            cartItemRepository.deleteByUserAndProduct(user, product);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }    @Override
    @Transactional
    public CartItem updateQuantity(Long productId, int quantity) {
        try {
            if (quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be positive");
            }
            
            User user = getCurrentUser();
            Product product = productRepository.findById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found");
            }
            Optional<CartItem> cartItemOpt = cartItemRepository.findByUserAndProduct(user, product);
            
            if (cartItemOpt.isEmpty()) {
                throw new IllegalArgumentException("Product not in cart");
            }
            
            CartItem cartItem = cartItemOpt.get();
            cartItem.setQuantity(quantity);
            return cartItemRepository.save(cartItem);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    @Transactional
    public boolean clearCart() {
        try {
            User user = getCurrentUser();
            cartItemRepository.deleteAllByUser(user);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public int getCartCount() {
        try {
            List<CartItem> cartItems = getCurrentUserCartItems();
            return cartItems.stream().mapToInt(CartItem::getQuantity).sum();
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public double getSubtotal() {
        try {
            List<CartItem> cartItems = getCurrentUserCartItems();
            return cartItems.stream().mapToDouble(CartItem::getSubtotal).sum();
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public double applyDiscount(double subtotal, double discountPercentage) {
        return subtotal * (discountPercentage / 100);
    }

    @Override
    public CouponValidationResult validateCoupon(String couponCode) {
        // In a real application, you would check against coupon codes in database
        // For now, we'll use a simple mock implementation
        if ("SALE10".equalsIgnoreCase(couponCode)) {
            return new CouponValidationResult(true, 10);
        } else if ("SUMMER20".equalsIgnoreCase(couponCode)) {
            return new CouponValidationResult(true, 20);
        }
        return new CouponValidationResult(false, 0);
    }
}
