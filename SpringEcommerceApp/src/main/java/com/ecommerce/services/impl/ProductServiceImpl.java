package com.ecommerce.services.impl;

import com.ecommerce.pojo.Product;
import com.ecommerce.repositories.ProductRepository;
import com.ecommerce.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
<<<<<<< Updated upstream
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
=======
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
>>>>>>> Stashed changes
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private Cloudinary cloudinary;

    @Override
    public Product save(Product product) {
        productRepository.save(product);
        return product;
    }

    @Override
<<<<<<< Updated upstream
    @CacheEvict(value = "products", allEntries = true)
    public void update(Product product) {
=======
    public Product update(Product product) {
>>>>>>> Stashed changes
        productRepository.update(product);
        return product;
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
<<<<<<< Updated upstream
}
=======

    @Override
    public List<Product> searchAdvanced(String name, Long storeId, Double minPrice, Double maxPrice,
                                        String sortBy, String sortDir, int page, int size) {
        return productRepository.searchAdvanced(name, storeId, minPrice, maxPrice, sortBy, sortDir, page, size);
    }    @Override
    public List<Product> findByStoreId(Long storeId) {
        return productRepository.findByStoreId(storeId);
    }    @Override
    public String uploadProductImage(MultipartFile imageFile) throws Exception {
        try {
            // Upload image to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", "ecommerce/products",
                "resource_type", "auto"
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(imageFile.getBytes(), params);
            
            // Get the secure URL from the upload result
            String imageUrl = (String) uploadResult.get("secure_url");
            
            return imageUrl;
        } catch (IOException e) {
            throw new Exception("Không thể tải lên hình ảnh: " + e.getMessage());
        }
    }
}
>>>>>>> Stashed changes
