package com.ecommerce.services;

import com.ecommerce.pojo.Store;
import java.util.List;

public interface StoreService {
    Store save(Store store);  // Trả về đối tượng Store sau khi lưu
    Store update(Store store); // Trả về đối tượng Store sau khi cập nhật
    boolean delete(Long id);
    Store findById(Long id);
    List<Store> findAll();
    List<Store> findBySellerId(Long sellerId);
}