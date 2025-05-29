package com.ecommerce.controllers;

import com.ecommerce.pojo.Store;
import com.ecommerce.pojo.User;
import com.ecommerce.services.StoreService;
import com.ecommerce.services.UserService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = { "https://localhost:3000" }, allowCredentials = "true", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
        RequestMethod.OPTIONS }, maxAge = 3600)

public class ApiStoreController {
    @Autowired
    private StoreService storeService;


    @Autowired
    private UserService userService;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("")
    public ResponseEntity<List<Store>> getAllStores() {
        return new ResponseEntity<>(storeService.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getStoreById(@PathVariable Long id) {
        Store store = storeService.findById(id);
        if (store != null) {
            return new ResponseEntity<>(store, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Store>> getStoresBySellerId(@PathVariable Long sellerId) {
        List<Store> stores = storeService.findByUserId(sellerId);
        return new ResponseEntity<>(stores, HttpStatus.OK);
    }

    @PostMapping("")
    public ResponseEntity<Store> createStore(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("address") String address,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "logo", required = false) String logoUrl,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Tạo đối tượng Store mới từ các tham số
            Store store = new Store();
            store.setName(name);
            store.setDescription(description);
            store.setAddress(address);
            store.setSeller(currentUser);

            // Xử lý logo
            if (file != null && !file.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                        ObjectUtils.emptyMap());
                String uploadedUrl = (String) uploadResult.get("url");
                store.setLogo(uploadedUrl);
            } else if (logoUrl != null && !logoUrl.isEmpty()) {
                // Sử dụng URL logo đã cung cấp
                store.setLogo(logoUrl);
            }

            Store createdStore = storeService.save(store);
            return new ResponseEntity<>(createdStore, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Store> updateStore(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("address") String address,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "logo", required = false) String logoUrl,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("Updating store with ID: " + id);
            System.out.println("Name: " + name);
            System.out.println("Description: " + description);
            System.out.println("Address: " + address);
            System.out.println("Logo URL: " + logoUrl);
            System.out.println("Has new file: " + (file != null && !file.isEmpty()));

            Store existingStore = storeService.findById(id);
            if (existingStore == null) {
                System.out.println("Store not found with ID: " + id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } // Security check: ensure current user is the owner of the store
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                System.out.println("Current user not found");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            if (existingStore.getSeller() == null || !existingStore.getSeller().getId().equals(currentUser.getId())) {
                System.out.println("User is not authorized to update this store");
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Cập nhật thông tin store
            existingStore.setName(name);
            existingStore.setDescription(description);
            existingStore.setAddress(address);
            // Xử lý logo
            try {
                if (file != null && !file.isEmpty()) {
                    System.out.println("Uploading new logo file to Cloudinary");
                    System.out.println("File name: " + file.getOriginalFilename());
                    System.out.println("File size: " + file.getSize());
                    System.out.println("File content type: " + file.getContentType());

                    // Kiểm tra kích thước file
                    if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                        throw new IllegalArgumentException("File too large (max 5MB)");
                    }

                    // Kiểm tra loại file
                    String contentType = file.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        throw new IllegalArgumentException("File must be an image");
                    }

                    @SuppressWarnings("unchecked")
                    Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                            ObjectUtils.emptyMap());
                    String uploadedUrl = (String) uploadResult.get("url");
                    System.out.println("New logo URL from Cloudinary: " + uploadedUrl);
                    existingStore.setLogo(uploadedUrl);
                } else if (logoUrl != null && !logoUrl.isEmpty()) {
                    System.out.println("Using provided logo URL: " + logoUrl);
                    // Sử dụng URL logo đã cung cấp
                    existingStore.setLogo(logoUrl);
                }
            } catch (IllegalArgumentException ex) {
                System.err.println("Input validation error: " + ex.getMessage());
                ex.printStackTrace();
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            } catch (Exception ex) {
                System.err.println("Error processing logo: " + ex.getMessage());
                ex.printStackTrace();
                // Tiếp tục cập nhật ngay cả khi xử lý logo thất bại
            }            System.out.println("Calling storeService.update()");
            Store updatedStore = storeService.update(existingStore);
            System.out.println("Store updated successfully");

            // Cập nhật thành công, trả về đối tượng đã cập nhật
            return new ResponseEntity<>(updatedStore, HttpStatus.OK);
        } catch (org.hibernate.exception.ConstraintViolationException e) {
            System.err.println("Database constraint violation: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        } catch (org.hibernate.LazyInitializationException e) {
            System.err.println("Hibernate lazy loading error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (org.springframework.dao.DataAccessException e) {
            System.err.println("Data access error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        } catch (Exception e) {
            System.err.println("Error updating store: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("Attempting to delete store with ID: " + id);
            
            // Get the store to check ownership
            Store existingStore = storeService.findById(id);
            if (existingStore == null) {
                System.out.println("Store not found with ID: " + id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Security check: ensure current user is the owner of the store or an admin
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                System.out.println("Current user not found");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase("ADMIN"));
                
            if (!isAdmin && (existingStore.getSeller() == null || 
                !existingStore.getSeller().getId().equals(currentUser.getId()))) {
                System.out.println("User is not authorized to delete this store");
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            System.out.println("Deleting store: " + existingStore.getName());
            boolean deleted = storeService.delete(id);
            
            if (deleted) {
                System.out.println("Store deleted successfully");
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                System.err.println("Failed to delete store with ID: " + id);
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            System.err.println("Error deleting store: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
