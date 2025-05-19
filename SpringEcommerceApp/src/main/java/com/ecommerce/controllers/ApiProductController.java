package com.ecommerce.controllers;

import com.ecommerce.pojo.Category;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.Store;
import com.ecommerce.services.CategoryService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class ApiProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private StoreService storeService;

    @GetMapping("")

    public ResponseEntity<?> getAllProducts(@RequestParam(value = "q", required = false) String keyword) {
        try {
            List<Product> products;
            if (keyword == null || keyword.isEmpty()) {
                products = productService.findAll();
            } else {
                products = productService.findByName(keyword);
            }
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching products: " + e.getMessage());
        }

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.findById(id);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching product: " + e.getMessage());
        }
    }

    @PostMapping(value = "", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/json" })
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long storeId) {
        try {
            // Log incoming request data for debugging
            System.out.println("Received product: " + product);
            System.out.println("Category ID: " + categoryId);
            System.out.println("Store ID: " + storeId);

            // Set category if provided
            if (categoryId != null) {
                Category category = categoryService.findById(categoryId);
                if (category != null) {
                    product.setCategory(category);
                }
            }

            // Set store if provided
            if (storeId != null) {
                Store store = storeService.findById(storeId);
                if (store != null) {
                    product.setStore(store);
                }
            }

            Product savedProduct = productService.save(product);

            // Force initialize relationships to avoid lazy loading issues
            if (savedProduct.getStore() != null) {
                savedProduct.getStore().getName();
            }
            if (savedProduct.getCategory() != null) {
                savedProduct.getCategory().getName();
            }

            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long storeId) {
        try {
            // Check if product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Set the ID for the product
            product.setId(id);

            // Set category if provided
            if (categoryId != null) {
                Category category = categoryService.findById(categoryId);
                if (category != null) {
                    product.setCategory(category);
                }
            } else if (existingProduct.getCategory() != null) {
                // Keep existing category if not specified
                product.setCategory(existingProduct.getCategory());
            }

            // Set store if provided
            if (storeId != null) {
                Store store = storeService.findById(storeId);
                if (store != null) {
                    product.setStore(store);
                }
            } else if (existingProduct.getStore() != null) {
                // Keep existing store if not specified
                product.setStore(existingProduct.getStore());
            }

            Product updatedProduct = productService.update(product);

            // Force initialize relationships to avoid lazy loading issues
            if (updatedProduct.getStore() != null) {
                updatedProduct.getStore().getName();
            }
            if (updatedProduct.getCategory() != null) {
                updatedProduct.getCategory().getName();
            }

            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            // Check if product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            productService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Product> products = productService.searchAdvanced(name, storeId, minPrice, maxPrice, sortBy, sortDir,
                    page, size);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching products: " + e.getMessage());
        }
    }
    

}

