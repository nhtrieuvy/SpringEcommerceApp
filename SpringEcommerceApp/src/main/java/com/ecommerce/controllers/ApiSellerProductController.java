package com.ecommerce.controllers;

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
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller/products")

public class ApiSellerProductController {
    private static final Logger logger = LoggerFactory.getLogger(ApiSellerProductController.class);

    @Autowired
    private ProductService productService;
    @Autowired
    private UserService userService;
    @Autowired
    private StoreService storeService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private RecentActivityService recentActivityService;

    @GetMapping("")
    public ResponseEntity<?> getProductsForSeller(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            List<Store> stores = storeService.findByUserId(currentUser.getId());
            if (stores.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Bạn cần tạo cửa hàng trước khi quản lý sản phẩm");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            Map<String, Object> response = new HashMap<>();
            for (Store store : stores) {
                List<Product> products = productService.findByStoreId(store.getId());
                for (Product product : products) {
                    if (product.getCategory() != null) {
                        product.getCategory().getName();
                    }
                    product.getStore().getName();
                }
                response.put(store.getName(), products);
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting products for seller", e);
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
            Store store = storeService.findById(storeId);
            if (store == null || !store.getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            List<Product> products = productService.findByStoreId(storeId);
            for (Product product : products) {
                if (product.getCategory() != null) {
                    product.getCategory().getName();
                }
                product.getStore().getName();
            }
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting products by store: {}", storeId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/json;charset=UTF-8", "*/*" })
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestParam("storeId") Long storeId,
            @RequestParam("categoryId") Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        try {
            logger.debug("Received createProduct request with product: {}", product);
            logger.debug("Store ID: {}", storeId);
            logger.debug("Category ID: {}", categoryId);
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            Store store = storeService.findById(storeId);
            if (store == null || !store.getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            product.setStore(store);
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            product.setCategory(category);
            product.setActive(true);
            Product createdProduct = productService.save(product);
            recentActivityService.logProductAdded(
                    currentUser.getEmail(),
                    currentUser.getFullname() != null ? currentUser.getFullname() : currentUser.getUsername(),
                    createdProduct.getId(),
                    createdProduct.getName(),
                    IpUtils.getClientIpAddress(request));
            if (createdProduct.getStore() != null) {
                createdProduct.getStore().getName();
            }
            if (createdProduct.getCategory() != null) {
                createdProduct.getCategory().getName();
            }
            return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating product", e);
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
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        try {
            logger.debug("Received product update request");
            logger.debug("Product ID: {}", id);
            logger.debug("Name: {}", name);
            logger.debug("Category ID: {}", categoryId);
            logger.debug("Image provided: {}", imageFile != null && !imageFile.isEmpty());
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(price);
            existingProduct.setQuantity(quantity);
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            existingProduct.setCategory(category);
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.uploadProductImage(imageFile);
                existingProduct.setImage(imageUrl);
            }
            Product updatedProduct = productService.update(existingProduct);
            recentActivityService.logProductUpdated(
                    currentUser.getEmail(),
                    currentUser.getFullname() != null ? currentUser.getFullname() : currentUser.getUsername(),
                    updatedProduct.getId(),
                    updatedProduct.getName(),
                    IpUtils.getClientIpAddress(request));
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
            logger.error("Error updating product: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật sản phẩm: " + e.getMessage());
            errorResponse.put("success", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            String productName = existingProduct.getName();
            Long productId = existingProduct.getId();
            productService.delete(id);
            recentActivityService.logProductDeleted(
                    currentUser.getEmail(),
                    currentUser.getFullname() != null ? currentUser.getFullname() : currentUser.getUsername(),
                    productId,
                    productName,
                    IpUtils.getClientIpAddress(request));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting product: {}", id, e);
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
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            String imageUrl = productService.uploadProductImage(imageFile);
            existingProduct.setImage(imageUrl);
            Product updatedProduct = productService.update(existingProduct);
            Map<String, Object> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("product", updatedProduct);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error uploading product image for product: {}", id, e);
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
            logger.debug("Received update product with image request");
            logger.debug("Product ID: {}", id);
            logger.debug("Name: {}", name);
            logger.debug("Category ID: {}", categoryId);
            logger.debug("Image provided: {}", imageFile != null && !imageFile.isEmpty());
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(price);
            existingProduct.setQuantity(quantity);
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            existingProduct.setCategory(category);
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.uploadProductImage(imageFile);
                existingProduct.setImage(imageUrl);
            }
            Product updatedProduct = productService.update(existingProduct);
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
            logger.error("Error updating product with image: {}", id, e);
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
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!existingProduct.getStore().getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            existingProduct.setActive(active);
            Product updatedProduct = productService.update(existingProduct);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating product status: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping("/stores")
    public ResponseEntity<?> getStoresForSeller(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            List<Store> stores = storeService.findByUserId(currentUser.getId());
            if (stores.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Bạn cần tạo cửa hàng trước khi quản lý sản phẩm");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            for (Store store : stores) {
                store.getProducts().size();
            }
            return new ResponseEntity<>(stores, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting stores for seller", e);
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
            logger.debug("Received create product with image request");
            logger.debug("Name: {}", name);
            logger.debug("Store ID: {}", storeId);
            logger.debug("Category ID: {}", categoryId);
            logger.debug("Image provided: {}", imageFile != null && !imageFile.isEmpty());
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            Store store = storeService.findById(storeId);
            if (store == null || !store.getSeller().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setQuantity(quantity);
            product.setStore(store);
            Category category = categoryService.findById(categoryId);
            if (category == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            product.setCategory(category);
            product.setActive(true);
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = productService.uploadProductImage(imageFile);
                product.setImage(imageUrl);
            }
            Product createdProduct = productService.save(product);
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
            logger.error("Error creating product with image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể tạo sản phẩm: " + e.getMessage());
            errorResponse.put("success", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
