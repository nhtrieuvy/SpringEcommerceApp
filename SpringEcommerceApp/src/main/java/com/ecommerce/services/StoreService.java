package com.ecommerce.services;

import com.ecommerce.pojo.Store;
import java.util.List;
import java.util.Map;

public interface StoreService {
    Store save(Store store);  // Trả về đối tượng Store sau khi lưu
    Store update(Store store); // Trả về đối tượng Store sau khi cập nhật
    boolean delete(Long id);
    Store findById(Long id);
    List<Store> findAll();
    List<Store> findByUserId(Long userId);
    
    // New methods to support the transition from Seller to User with Seller role
    List<Map<String, Object>> findAllWithUserInfo();
    Map<String, Object> findByIdWithUserInfo(Long id);
    boolean toggleStatus(Long id);
}