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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")

public class ApiStoreController {
    private static final Logger logger = LoggerFactory.getLogger(ApiStoreController.class);

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
            Store store = new Store();
            store.setName(name);
            store.setDescription(description);
            store.setAddress(address);
            store.setSeller(currentUser);
            if (file != null && !file.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                        ObjectUtils.emptyMap());
                String uploadedUrl = (String) uploadResult.get("url");
                store.setLogo(uploadedUrl);
            } else if (logoUrl != null && !logoUrl.isEmpty()) {
                store.setLogo(logoUrl);
            }
            Store createdStore = storeService.save(store);
            return new ResponseEntity<>(createdStore, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating store", e);
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
            logger.debug("Updating store with ID: {}", id);
            logger.debug("Name: {}", name);
            logger.debug("Description: {}", description);
            logger.debug("Address: {}", address);
            logger.debug("Logo URL: {}", logoUrl);
            logger.debug("Has new file: {}", file != null && !file.isEmpty());
            Store existingStore = storeService.findById(id);
            if (existingStore == null) {
                logger.debug("Store not found with ID: {}", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                logger.debug("Current user not found");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            if (existingStore.getSeller() == null || !existingStore.getSeller().getId().equals(currentUser.getId())) {
                logger.debug("User is not authorized to update this store");
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            existingStore.setName(name);
            existingStore.setDescription(description);
            existingStore.setAddress(address);
            try {
                if (file != null && !file.isEmpty()) {
                    logger.debug("Uploading new logo file to Cloudinary");
                    logger.debug("File name: {}", file.getOriginalFilename());
                    logger.debug("File size: {}", file.getSize());
                    logger.debug("File content type: {}", file.getContentType());
                    if (file.getSize() > 5 * 1024 * 1024) {
                        throw new IllegalArgumentException("File too large (max 5MB)");
                    }
                    String contentType = file.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        throw new IllegalArgumentException("File must be an image");
                    }
                    @SuppressWarnings("unchecked")
                    Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                            ObjectUtils.emptyMap());
                    String uploadedUrl = (String) uploadResult.get("url");
                    logger.debug("New logo URL from Cloudinary: {}", uploadedUrl);
                    existingStore.setLogo(uploadedUrl);
                } else if (logoUrl != null && !logoUrl.isEmpty()) {
                    logger.debug("Using provided logo URL: {}", logoUrl);
                    existingStore.setLogo(logoUrl);
                }
            } catch (IllegalArgumentException ex) {
                logger.warn("Input validation error", ex);
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            } catch (Exception ex) {
                logger.error("Error processing logo", ex);
            }
            logger.debug("Calling storeService.update()");
            Store updatedStore = storeService.update(existingStore);
            logger.debug("Store updated successfully");
            return new ResponseEntity<>(updatedStore, HttpStatus.OK);
        } catch (org.hibernate.exception.ConstraintViolationException e) {
            logger.error("Database constraint violation", e);
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        } catch (org.hibernate.LazyInitializationException e) {
            logger.error("Hibernate lazy loading error", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (org.springframework.dao.DataAccessException e) {
            logger.error("Data access error", e);
            return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
        } catch (Exception e) {
            logger.error("Error updating store", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            logger.debug("Attempting to delete store with ID: {}", id);
            Store existingStore = storeService.findById(id);
            if (existingStore == null) {
                logger.debug("Store not found with ID: {}", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (currentUser == null) {
                logger.debug("Current user not found");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            boolean isAdmin = currentUser.getRoles().stream()
                    .anyMatch(role -> role.getName().equalsIgnoreCase("ADMIN"));
            if (!isAdmin && (existingStore.getSeller() == null ||
                    !existingStore.getSeller().getId().equals(currentUser.getId()))) {
                logger.debug("User is not authorized to delete this store");
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            logger.debug("Deleting store: {}", existingStore.getName());
            boolean deleted = storeService.delete(id);
            if (deleted) {
                logger.debug("Store deleted successfully");
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                logger.warn("Failed to delete store with ID: {}", id);
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            logger.error("Error deleting store: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
