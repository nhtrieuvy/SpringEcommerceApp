package com.ecommerce.services.impl;

import com.ecommerce.pojo.Product;
import com.ecommerce.repositories.ProductRepository;
import com.ecommerce.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Override
    public void save(Product product) {
        productRepository.save(product);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void update(Product product) {
        productRepository.update(product);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void delete(Long id) {
        productRepository.delete(id);
    }

    @Override
    @Cacheable(value = "products", key = "#id", unless = "#result == null")
    public Product findById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    @Cacheable(value = "products", key = "'all'", unless = "#result.isEmpty()")
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Override
    @Cacheable(value = "products", key = "'name-' + #name", unless = "#result.isEmpty()")
    public List<Product> findByName(String name) {
        return productRepository.findByName(name);
    }
    
    @Override
    @Cacheable(value = "products", key = "'category-' + #categoryId", unless = "#result.isEmpty()")
    public List<Product> findByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
    
    @Override
    @Cacheable(value = "products", key = "'price-' + #minPrice + '-' + #maxPrice", unless = "#result.isEmpty()")
    public List<Product> findByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    @Override
    public List<Product> search(String keyword) {
        return productRepository.search(keyword);
    }
}