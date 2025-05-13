package com.ecommerce.repositories;

import com.ecommerce.pojo.Store;
import java.util.List;
import java.util.Map;

public interface StoreRepository {
    void save(Store store);
    void update(Store store);
    void delete(Long id);
    Store findById(Long id);
    List<Store> findAll();
    List<Store> findByUserId(Long userId);
    List<Map<String, Object>> findAllWithUserInfo();
    Map<String, Object> findByIdWithUserInfo(Long id);
}