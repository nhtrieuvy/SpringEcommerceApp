package com.ecommerce.services;

import com.ecommerce.pojo.WishlistItem;
import java.util.List;

public interface WishlistService {
    /**
     * Get all wishlist items for the current authenticated user
     * @return List of wishlist items
     */
    List<WishlistItem> getCurrentUserWishlistItems();
    
    /**
     * Add a product to wishlist
     * @param productId ID of the product to add
     * @return The added wishlist item or null if failed
     */
    WishlistItem addToWishlist(Long productId);
    
    /**
     * Remove a product from wishlist
     * @param productId ID of the product to remove
     * @return true if successful, false otherwise
     */
    boolean removeFromWishlist(Long productId);
    
    /**
     * Check if a product is in the current user's wishlist
     * @param productId ID of the product to check
     * @return true if in wishlist, false otherwise
     */
    boolean isInWishlist(Long productId);
    
    /**
     * Clear all items from wishlist
     * @return true if successful, false otherwise
     */
    boolean clearWishlist();
    
    /**
     * Get count of items in wishlist
     * @return Count of items
     */
    int getWishlistCount();
    
    /**
     * Move an item from wishlist to cart
     * @param productId ID of the product to move
     * @return true if successful, false otherwise
     */
    boolean moveToCart(Long productId);
    
    /**
     * Move all items from wishlist to cart
     * @return true if successful, false otherwise
     */
    boolean moveAllToCart();
}
