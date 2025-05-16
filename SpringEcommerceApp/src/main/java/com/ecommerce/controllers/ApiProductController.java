package com.ecommerce.controllers;

import com.ecommerce.pojo.Product;
import com.ecommerce.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class ApiProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("")
    public List<Product> getAllProducts(@RequestParam(value = "q", required = false) String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return productService.findAll();
        }
        return productService.findByName(keyword);
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping("")
    public void createProduct(@RequestBody Product product) {
        productService.save(product);
    }

    @PutMapping("/{id}")
    public void updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        productService.update(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.delete(id);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.searchAdvanced(name, storeId, minPrice, maxPrice, sortBy, sortDir, page, size);
    }

}
