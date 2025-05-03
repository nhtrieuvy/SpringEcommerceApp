package com.ecommerce.repositories;

import com.ecommerce.pojo.Store;
import java.util.List;

public interface StoreRepository {
    void save(Store store);
    void update(Store store);
    void delete(Long id);
    Store findById(Long id);
    List<Store> findAll();
    List<Store> findBySellerId(Long sellerId);
}