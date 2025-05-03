package com.ecommerce.services;

import com.ecommerce.pojo.Product;
import java.util.List;

public interface ProductService {
    void save(Product product);
    void update(Product product);
    void delete(Long id);
    Product findById(Long id);
    List<Product> findAll();
    List<Product> findByName(String name);
}