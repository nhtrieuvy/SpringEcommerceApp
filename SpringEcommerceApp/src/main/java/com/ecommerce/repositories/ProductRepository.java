package com.ecommerce.repositories;

import com.ecommerce.pojo.Product;
import java.util.List;

public interface ProductRepository {
    void save(Product product);
    void update(Product product);
    void delete(Long id);
    Product findById(Long id);
    List<Product> findAll();
    List<Product> findByName(String name);
}