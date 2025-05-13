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
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByPriceRange(Double minPrice, Double maxPrice);
    List<Product> search(String keyword);
    List<Product> findByStoreId(Long storeId);

    List<Product> searchAdvanced(String name, Long storeId, Double minPrice, Double maxPrice,
                                 String sortBy, String sortDir, int page, int size);
}
