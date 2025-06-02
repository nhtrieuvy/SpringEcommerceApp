package com.ecommerce.controllers;

import com.ecommerce.dtos.ProductComparisonDTO;
import com.ecommerce.pojo.Category;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.Store;
import com.ecommerce.pojo.User;
import com.ecommerce.services.CategoryService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.RecentActivityService;
import com.ecommerce.services.StoreService;
import com.ecommerce.services.UserService;
import com.ecommerce.utils.IpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/products")

public class ApiProductController {
    @Autowired
    private ProductService productService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private StoreService storeService;
    @Autowired
    private RecentActivityService recentActivityService;
    @Autowired
    private UserService userService;

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
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long storeId,
            HttpServletRequest request) {
        try {
            System.out.println("Received product: " + product);
            System.out.println("Category ID: " + categoryId);
            System.out.println("Store ID: " + storeId);
            if (categoryId != null) {
                Category category = categoryService.findById(categoryId);
                if (category != null) {
                    product.setCategory(category);
                }
            }
            if (storeId != null) {
                Store store = storeService.findById(storeId);
                if (store != null) {
                    product.setStore(store);
                }
            }
            Product savedProduct = productService.save(product);
            if (savedProduct.getStore() != null) {
                savedProduct.getStore().getName();
            }
            if (savedProduct.getCategory() != null) {
                savedProduct.getCategory().getName();
            }
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductAdded(
                            currentUser.getFullname(),
                            currentUser.getEmail(),
                            savedProduct.getId(),
                            savedProduct.getName(),
                            ipAddress);
                }
            }
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Product> updateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long storeId,
            HttpServletRequest request) {
        try {
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            product.setId(id);
            if (categoryId != null) {
                Category category = categoryService.findById(categoryId);
                if (category != null) {
                    product.setCategory(category);
                }
            } else if (existingProduct.getCategory() != null) {
                product.setCategory(existingProduct.getCategory());
            }
            if (storeId != null) {
                Store store = storeService.findById(storeId);
                if (store != null) {
                    product.setStore(store);
                }
            } else if (existingProduct.getStore() != null) {
                product.setStore(existingProduct.getStore());
            }
            Product updatedProduct = productService.update(product);
            if (updatedProduct.getStore() != null) {
                updatedProduct.getStore().getName();
            }
            if (updatedProduct.getCategory() != null) {
                updatedProduct.getCategory().getName();
            }
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductUpdated(
                            currentUser.getFullname(),
                            currentUser.getEmail(),
                            updatedProduct.getId(),
                            updatedProduct.getName(),
                            ipAddress);
                }
            }
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            String productName = existingProduct.getName();
            productService.delete(id);
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductDeleted(
                            currentUser.getFullname(),
                            currentUser.getEmail(),
                            id,
                            productName,
                            ipAddress);
                }
            }
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
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

    @GetMapping("/compare")
    public ResponseEntity<?> compareProductsByCategory(@RequestParam Long categoryId) {
        try {
            List<ProductComparisonDTO> comparisonResults = productService.compareProductsByCategory(categoryId);
            return ResponseEntity.ok(comparisonResults);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error comparing products: " + e.getMessage());
        }
    }

    @GetMapping("/compare-with-product")
    public ResponseEntity<?> compareWithProduct(@RequestParam Long productId) {
        try {
            Product product = productService.findById(productId);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            List<ProductComparisonDTO> comparisonResults = productService
                    .compareProductsByCategory(product.getCategory().getId());
            return ResponseEntity.ok(comparisonResults);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error comparing products: " + e.getMessage());
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            List<Product> recommendedProducts = new ArrayList<>();
            if (productId != null) {
                Product product = productService.findById(productId);
                if (product != null && product.getCategory() != null) {
                    List<Product> similarProducts = productService.findByCategoryId(product.getCategory().getId());
                    recommendedProducts = similarProducts.stream()
                            .filter(p -> !p.getId().equals(productId))
                            .limit(limit)
                            .toList();
                }
            } else if (categoryId != null) {
                recommendedProducts = productService.findByCategoryId(categoryId).stream()
                        .limit(limit)
                        .toList();
            } else {
                recommendedProducts = productService.findAll().stream()
                        .limit(limit)
                        .toList();
            }
            return ResponseEntity.ok(recommendedProducts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching product recommendations: " + e.getMessage());
        }
    }
}
