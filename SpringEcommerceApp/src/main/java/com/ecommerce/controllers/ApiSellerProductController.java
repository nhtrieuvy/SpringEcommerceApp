package com.ecommerce.controllers;

import com.ecommerce.pojo.Category;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.Store;
import com.ecommerce.pojo.User;
import com.ecommerce.services.CategoryService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.StoreService;
import com.ecommerce.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller/products")
@CrossOrigin(origins = { "https://localhost:3000" }, allowCredentials = "true", allowedHeaders = { "*", "Content-Type",
        "X-Requested-With", "accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers",
        "Authorization" }, exposedHeaders = { "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials" }, methods = { RequestMethod.GET, RequestMethod.POST,
                        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, maxAge = 3600)
public class ApiSellerProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private StoreService storeService;

    @Autowired
    private CategoryService categoryService;

    @GetMapping("")
    public ResponseEntity<?> getProductsForSeller(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Get all stores owned by the current user
            List<Store> stores = storeService.findByUserId(currentUser.getId());
            if (stores.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Bạn cần tạo cửa hàng trước khi quản lý sản phẩm");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Get products for all stores owned by the seller
            Map<String, Object> response = new HashMap<>();
            for (Store store : stores) {
                List<Product> products = productService.findByStoreId(store.getId());

                // Process each product to avoid lazy loading issues
                for (Product product : products) {
                    // Initialize the category for each product
                    if (product.getCategory() != null) {
                        product.getCategory().getName(); // Force initialization
                    }

                    // Store is already initialized in findByStoreId
                    product.getStore().getName(); // Ensure store is initialized
                }

                response.put(store.getName(), products);
            }

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<Product>> getProductsByStore(
            @PathVariable Long storeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the store belongs to the current user
            Store store = storeService.findById(storeId);
            if (store == null || !store.getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            List<Product> products = productService.findByStoreId(storeId);

            // Process each product to avoid lazy loading issues
            for (Product product : products) {
                // Initialize the category for each product
                if (product.getCategory() != null) {
                    product.getCategory().getName(); // Force initialization
                }

                // Initialize store
                product.getStore().getName(); // Ensure store is initialized
            }

            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/json;charset=UTF-8", "*/*" })
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestParam("storeId") Long storeId,
            @RequestParam("categoryId") Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Log incoming request for debugging
            System.out.println("Received createProduct request with product: " + product);
            System.out.println("Store ID: " + storeId);
            System.out.println("Category ID: " + categoryId);

            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the store belongs to the current user
            Store store = storeService.findById(storeId);
            if (store == null || !store.getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Set the store for the product
            product.setStore(store);

            // Set the category for the product
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            product.setCategory(category);

            // Ensure the product is active by default
            product.setActive(true);

            Product createdProduct = productService.save(product);

            // Force initialize relationships to avoid lazy loading issues
            if (createdProduct.getStore() != null) {
                createdProduct.getStore().getName();
            }
            if (createdProduct.getCategory() != null) {
                createdProduct.getCategory().getName();
            }

            return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Log incoming request for debugging
            System.out.println("Received product update request");
            System.out.println("Product ID: " + id);
            System.out.println("Name: " + name);
            System.out.println("Category ID: " + categoryId);
            System.out.println("Image provided: " + (imageFile != null && !imageFile.isEmpty()));

            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if the product belongs to a store owned by the current user
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Update product with new values
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(price);
            existingProduct.setQuantity(quantity);

            // Update category if it has changed
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            existingProduct.setCategory(category);

            // Upload new image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.uploadProductImage(imageFile);
                existingProduct.setImage(imageUrl);
            }

            Product updatedProduct = productService.update(existingProduct);

            // Force initialize relationships to avoid lazy loading issues
            if (updatedProduct.getStore() != null) {
                updatedProduct.getStore().getName();
            }
            if (updatedProduct.getCategory() != null) {
                updatedProduct.getCategory().getName();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("product", updatedProduct);
            response.put("message", "Sản phẩm đã được cập nhật thành công");
            response.put("success", true);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật sản phẩm: " + e.getMessage());
            errorResponse.put("success", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if the product belongs to a store owned by the current user
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Delete the product
            productService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if the product belongs to a store owned by the current user
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Upload image and get URL
            String imageUrl = productService.uploadProductImage(imageFile);

            // Update product with new image URL
            existingProduct.setImage(imageUrl);
            Product updatedProduct = productService.update(existingProduct);

            Map<String, Object> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("product", updatedProduct);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Không thể tải lên hình ảnh: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/{id}/update-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProductWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Log incoming request for debugging
            System.out.println("Received update product with image request");
            System.out.println("Product ID: " + id);
            System.out.println("Name: " + name);
            System.out.println("Category ID: " + categoryId);
            System.out.println("Image provided: " + (imageFile != null && !imageFile.isEmpty()));

            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if the product belongs to a store owned by the current user
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Update product with new values
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(price);
            existingProduct.setQuantity(quantity);

            // Update category if it has changed
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            existingProduct.setCategory(category);

            // Upload new image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.uploadProductImage(imageFile);
                existingProduct.setImage(imageUrl);
            }

            Product updatedProduct = productService.update(existingProduct);

            // Force initialize relationships to avoid lazy loading issues
            if (updatedProduct.getStore() != null) {
                updatedProduct.getStore().getName();
            }
            if (updatedProduct.getCategory() != null) {
                updatedProduct.getCategory().getName();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("product", updatedProduct);
            response.put("message", "Sản phẩm đã được cập nhật thành công");
            response.put("success", true);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật sản phẩm: " + e.getMessage());
            errorResponse.put("success", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable Long id,
            @RequestParam("active") boolean active,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the product exists
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if the product belongs to a store owned by the current user
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Update product status
            existingProduct.setActive(active);
            Product updatedProduct = productService.update(existingProduct);

            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    } // The alternative endpoint for product creation without image was removed
    // Only creation with image is now supported through /create-with-image endpoint

    @GetMapping("/stores")
    public ResponseEntity<?> getStoresForSeller(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Get all stores owned by the current user
            List<Store> stores = storeService.findByUserId(currentUser.getId());
            if (stores.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Bạn cần tạo cửa hàng trước khi quản lý sản phẩm");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Initialize products collection for each store
            for (Store store : stores) {
                store.getProducts().size(); // Force initialization of products collection
            }
            return new ResponseEntity<>(stores, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProductWithImage(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("storeId") Long storeId,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Log incoming request for debugging
            System.out.println("Received create product with image request");
            System.out.println("Name: " + name);
            System.out.println("Store ID: " + storeId);
            System.out.println("Category ID: " + categoryId);
            System.out.println("Image provided: " + (imageFile != null && !imageFile.isEmpty()));

            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if the store belongs to the current user
            Store store = storeService.findById(storeId);
            if (store == null || !store.getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Create new product object
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setQuantity(quantity);
            product.setStore(store);

            // Set the category for the product
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            product.setCategory(category);

            // Ensure the product is active by default
            product.setActive(true);

            // Upload image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.uploadProductImage(imageFile);
                product.setImage(imageUrl);
            }

            Product createdProduct = productService.save(product);

            // Force initialize relationships to avoid lazy loading issues
            if (createdProduct.getStore() != null) {
                createdProduct.getStore().getName();
            }
            if (createdProduct.getCategory() != null) {
                createdProduct.getCategory().getName();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("product", createdProduct);
            response.put("message", "Sản phẩm đã được tạo thành công");
            response.put("success", true);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể tạo sản phẩm: " + e.getMessage());
            errorResponse.put("success", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
