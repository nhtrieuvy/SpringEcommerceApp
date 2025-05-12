package com.ecommerce.repositories;

import com.ecommerce.pojo.Product;

import java.util.List;

public interface ProductRepository {
    void save(Product product);
    void update(Product product);
    void delete(Long id);
    Product findById(Long id);
    List<Product> findAll();
    List<Product> searchAdvanced(String name, Long storeId, Double minPrice, Double maxPrice, String sortBy, String sortDir, int page, int size);

    public List<Product> findByName(String name);

    public List<Product> findByCategoryId(Long categoryId);

    public List<Product> findByPriceRange(Double minPrice, Double maxPrice);

    public List<Product> search(String keyword);
}
