package com.ecommerce.services;

import com.ecommerce.pojo.Store;
import java.util.List;
import java.util.Map;

public interface StoreService {
    void save(Store store);
    void update(Store store);
    void delete(Long id);
    Store findById(Long id);
    List<Store> findAll();
    List<Store> findByUserId(Long userId);
    
    // New methods to support the transition from Seller to User with Seller role
    List<Map<String, Object>> findAllWithUserInfo();
    Map<String, Object> findByIdWithUserInfo(Long id);
    boolean toggleStatus(Long id);
}