package com.ecommerce.repositories;

import com.ecommerce.pojo.CartItem;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository{
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
    void deleteAllByUser(User user);
    CartItem save(CartItem cartItem);
}
