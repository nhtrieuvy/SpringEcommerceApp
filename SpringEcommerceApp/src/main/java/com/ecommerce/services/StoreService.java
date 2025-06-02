package com.ecommerce.services;

import com.ecommerce.pojo.Store;
import java.util.List;
import java.util.Map;

public interface StoreService {
    Store save(Store store);  
    Store update(Store store); 
    boolean delete(Long id);
    Store findById(Long id);
    List<Store> findAll();
    List<Store> findByUserId(Long userId);
    
    
    List<Map<String, Object>> findAllWithUserInfo();
    Map<String, Object> findByIdWithUserInfo(Long id);
    boolean toggleStatus(Long id);
}