package com.ecommerce.services;

import com.ecommerce.pojo.CartItem;
import java.util.List;

public interface CartService {
   
    List<CartItem> getCurrentUserCartItems();
    
    
    CartItem addToCart(Long productId, int quantity);
    
    boolean removeFromCart(Long productId);
    
   
    CartItem updateQuantity(Long productId, int quantity);
    
    
    boolean clearCart();
    
   
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
