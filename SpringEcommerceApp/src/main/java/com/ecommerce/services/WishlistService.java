package com.ecommerce.services;

import com.ecommerce.pojo.WishlistItem;
import java.util.List;

public interface WishlistService {
    
    List<WishlistItem> getCurrentUserWishlistItems();
    
  
    WishlistItem addToWishlist(Long productId);
    
    
    boolean removeFromWishlist(Long productId);
    
   
    boolean isInWishlist(Long productId);
    
    
    boolean clearWishlist();
    
  
    int getWishlistCount();
    

    boolean moveToCart(Long productId);
    
 
    boolean moveAllToCart();
}
