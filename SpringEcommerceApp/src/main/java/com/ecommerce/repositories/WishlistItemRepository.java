package com.ecommerce.repositories;

import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.pojo.WishlistItem;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository {
    List<WishlistItem> findByUser(User user);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
    void deleteAllByUser(User user);
    boolean existsByUserAndProduct(User user, Product product);
    WishlistItem save(WishlistItem wishlistItem);
}
