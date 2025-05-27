package com.ecommerce.services;

import com.ecommerce.pojo.CartItem;
import com.ecommerce.pojo.Product;

import java.util.List;
import java.util.Optional;

public interface CartService {
    /**
     * Get all cart items for the current authenticated user
     * @return List of cart items
     */
    List<CartItem> getCurrentUserCartItems();
    
    /**
     * Add a product to cart
     * @param productId ID of the product to add
     * @param quantity Quantity to add
     * @return The added cart item or null if failed
     */
    CartItem addToCart(Long productId, int quantity);
    
    /**
     * Remove a product from cart
     * @param productId ID of the product to remove
     * @return true if successful, false otherwise
     */
    boolean removeFromCart(Long productId);
    
    /**
     * Update quantity of a cart item
     * @param productId ID of the product in cart
     * @param quantity New quantity
     * @return The updated cart item or null if failed
     */
    CartItem updateQuantity(Long productId, int quantity);
    
    /**
     * Clear all items from cart
     * @return true if successful, false otherwise
     */
    boolean clearCart();
    
    /**
     * Get total quantity of items in cart
     * @return Total quantity
     */
    int getCartCount();
    
    /**
     * Calculate subtotal of all cart items
     * @return Subtotal price
     */
    double getSubtotal();
    
    /**
     * Calculate discount based on a percentage
     * @param subtotal The subtotal to apply discount to
     * @param discountPercentage Discount percentage (e.g., 10 for 10%)
     * @return Discount amount
     */
    double applyDiscount(double subtotal, double discountPercentage);
    
    /**
     * Validate a coupon code
     * @param couponCode The coupon code to validate
     * @return Object containing validation result and discount percentage
     */
    CouponValidationResult validateCoupon(String couponCode);
    
    /**
     * Represents the result of coupon validation
     */
    class CouponValidationResult {
        private boolean isValid;
        private double discount;
        
        public CouponValidationResult(boolean isValid, double discount) {
            this.isValid = isValid;
            this.discount = discount;
        }
        
        public boolean isValid() {
            return isValid;
        }
        
        public double getDiscount() {
            return discount;
        }
    }
}
